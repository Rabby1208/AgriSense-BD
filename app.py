
import os
import sys
import importlib.util
import threading
from io import BytesIO
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError


# ==========================================
# CONFIGURATION
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INFERENCE_PATH = os.path.join(BASE_DIR, "inference.py")

ALLOWED_CROPS = ["rice", "potato", "tomato", "maize"]

ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
]

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 40_000_000

MODULE_NAME = "agrisense_model_inference"

MODEL = None
INFERENCE = None

PREDICTION_LOCK = threading.Lock()


# ==========================================
# LOAD INFERENCE MODULE
# ==========================================

def load_inference_module():

    global INFERENCE

    if not os.path.isfile(INFERENCE_PATH):

        raise FileNotFoundError(
            f"Local inference.py not found: {INFERENCE_PATH}"
        )

    spec = importlib.util.spec_from_file_location(
        MODULE_NAME,
        INFERENCE_PATH
    )

    if spec is None or spec.loader is None:

        raise RuntimeError(
            "Could not initialize local inference module."
        )

    INFERENCE = importlib.util.module_from_spec(spec)

    sys.modules[MODULE_NAME] = INFERENCE

    spec.loader.exec_module(INFERENCE)

    required_functions = [
        "load_model",
        "predict_image",
        "predict_image_for_crop",
        "assess_plant"
    ]

    for function_name in required_functions:

        if not hasattr(INFERENCE, function_name):

            raise RuntimeError(
                f"Missing inference function: {function_name}"
            )

    print(
        "Local inference module loaded successfully.",
        flush=True
    )


# ==========================================
# INITIALIZE MODEL MANAGER
# ==========================================

def load_inference_model():

    global MODEL

    print(
        "Initializing AgriSense lazy model system...",
        flush=True
    )

    load_inference_module()

    # This initializes the manager only.
    # Actual model weights load on first prediction.
    MODEL = INFERENCE.load_model()

    if MODEL is None:

        raise RuntimeError(
            "AgriSense model manager failed to initialize."
        )

    print(
        "AgriSense model manager initialized.",
        flush=True
    )

    print(
        "Supported crops:",
        MODEL.crops,
        flush=True
    )


# ==========================================
# APPLICATION LIFESPAN
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    load_inference_model()

    yield

    print(
        "AgriSense ML service stopped.",
        flush=True
    )


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="AgriSense BD ML Service",
    description=(
        "Memory-optimized crop and plant health "
        "classification service."
    ),
    version="2.1.0",
    lifespan=lifespan
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://agri-sense-bd-project.pages.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# ROOT API
# ==========================================

@app.get("/")
async def home():

    return {
        "success": True,
        "service": "AgriSense BD ML Service",
        "message": "ML service is running.",
        "model_system": "Lazy-loaded Multi-model Transformers",
        "docs": "/docs",
        "health": "/health"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
async def health_check():

    manager_ready = MODEL is not None

    active_model_loaded = (
        MODEL.is_model_loaded
        if manager_ready
        else False
    )

    return {

        "success": True,

        "service": "AgriSense BD ML Service",

        # Manager initialization status.
        # Actual model weights load on first prediction.
        "model_loaded": manager_ready,

        "inference_loaded": INFERENCE is not None,

        "active_model_loaded": active_model_loaded,

        "loaded_model_group": (
            MODEL.loaded_model_group
            if manager_ready
            else None
        ),

        "model_version": (
            MODEL.version
            if manager_ready
            else None
        ),

        "supported_crops": (
            MODEL.crops
            if manager_ready
            else []
        ),

        "loading_strategy": "one_model_group_at_a_time"

    }


# ==========================================
# IMAGE VALIDATION
# ==========================================

async def validate_image(file: UploadFile):

    if file.content_type not in ALLOWED_CONTENT_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed."
        )

    image_bytes = await file.read()

    if not image_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:

        raise HTTPException(
            status_code=413,
            detail="Image size must not exceed 5 MB."
        )

    try:

        with Image.open(BytesIO(image_bytes)) as image:

            if image.format not in ["JPEG", "PNG", "WEBP"]:

                raise HTTPException(
                    status_code=400,
                    detail="Unsupported image format."
                )

            width, height = image.size

            if width < 1 or height < 1:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid image dimensions."
                )

            if width * height > MAX_IMAGE_PIXELS:

                raise HTTPException(
                    status_code=400,
                    detail="Image dimensions are too large."
                )

            image.verify()

    except HTTPException:
        raise

    except (
        UnidentifiedImageError,
        OSError,
        Image.DecompressionBombError
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image."
        )

    return image_bytes


# ==========================================
# THREAD-SAFE MODEL PREDICTION
# ==========================================

def predict_image_safely(image_bytes, selected_crop):

    if MODEL is None or INFERENCE is None:

        raise RuntimeError(
            "ML model manager is not available."
        )

    with PREDICTION_LOCK:

        return INFERENCE.predict_image(
            image_bytes,
            MODEL,
            selected_crop
        )


# ==========================================
# SHARED MODEL PREDICTION
# ==========================================

async def run_model_prediction(crop, image):

    if MODEL is None or INFERENCE is None:

        raise HTTPException(
            status_code=503,
            detail="ML model manager is not available."
        )

    selected_crop = crop.strip().lower()

    if selected_crop not in ALLOWED_CROPS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid crop. Allowed crops: "
                + ", ".join(ALLOWED_CROPS)
            )
        )

    image_bytes = await validate_image(image)

    try:

        prediction = await run_in_threadpool(
            predict_image_safely,
            image_bytes,
            selected_crop
        )

        if not isinstance(prediction, dict):

            raise ValueError(
                "Invalid prediction response from model."
            )

        return selected_crop, prediction

    except HTTPException:
        raise

    except Exception as error:

        invalid_image_error = getattr(
            INFERENCE,
            "InvalidImageError",
            None
        )

        if (
            invalid_image_error is not None
            and isinstance(error, invalid_image_error)
        ):

            raise HTTPException(
                status_code=400,
                detail=str(error)
            )

        print(
            "Prediction Error:",
            repr(error),
            flush=True
        )

        raise HTTPException(
            status_code=500,
            detail="Disease prediction failed."
        )


# ==========================================
# CROP COMPARISON
# ==========================================

def get_dominant_crop(crop_probabilities):

    if not isinstance(crop_probabilities, dict):

        return None, None

    valid_probabilities = {

        crop_name: probability

        for crop_name, probability in crop_probabilities.items()

        if (
            isinstance(probability, (int, float))
            and not isinstance(probability, bool)
        )

    }

    if not valid_probabilities:

        return None, None

    dominant_crop = max(
        valid_probabilities,
        key=valid_probabilities.get
    )

    return (
        dominant_crop,
        valid_probabilities[dominant_crop]
    )


# ==========================================
# PREDICTION RESPONSE FORMATTER
# ==========================================

def format_prediction(result, selected_crop):

    status = result.get("status", "unknown")
    confidence = result.get("confidence")

    common = {
        "model_version": result.get("model_version"),
        "inference_ms": result.get("inference_ms")
    }

    crop_probabilities = result.get(
        "crop_probabilities", {}
    )

    dominant_crop, dominant_probability = get_dominant_crop(
        crop_probabilities
    )

    if status == "unknown":

        if (
            dominant_crop is not None
            and dominant_crop != selected_crop
        ):

            return {

                "detection_status": "crop_mismatch",

                "disease_detected": False,

                "selected_crop": selected_crop,

                "likely_crop": dominant_crop,

                "likely_crop_probability": round(
                    float(dominant_probability), 4
                ),

                "confidence": confidence,

                "message": (
                    f"You selected {selected_crop}, but the model "
                    f"leans toward {dominant_crop}. Please verify "
                    "the crop and upload a clear plant image."
                ),

                **common

            }

        return {

            "detection_status": "unknown",

            "disease_detected": False,

            "selected_crop": selected_crop,

            "confidence": confidence,

            "message": result.get(
                "message",
                "The image could not be reliably identified."
            ),

            **common

        }

    if status == "uncertain":

        if (
            dominant_crop is not None
            and dominant_crop != selected_crop
        ):

            return {

                "detection_status": "crop_mismatch",

                "disease_detected": False,

                "selected_crop": selected_crop,

                "likely_crop": dominant_crop,

                "likely_crop_probability": round(
                    float(dominant_probability), 4
                ),

                "confidence": confidence,

                "message": (
                    "The model is leaning toward a different crop "
                    "than the one you selected. Please check the "
                    "selected crop and uploaded image."
                ),

                **common

            }

        possible_condition = None
        possible_confidence = None

        top_predictions = result.get(
            "top_predictions", []
        )

        if isinstance(top_predictions, list):

            for item in top_predictions:

                if not isinstance(item, dict):
                    continue

                class_id = item.get("class", "")

                if (
                    isinstance(class_id, str)
                    and class_id.startswith(selected_crop + "|")
                ):

                    possible_condition = item.get(
                        "display_name"
                    )

                    possible_confidence = item.get(
                        "confidence"
                    )

                    break

        response = {

            "detection_status": "uncertain",

            "disease_detected": False,

            "crop": selected_crop,

            "confidence": confidence,

            "message": (
                "The selected crop appears consistent with the model "
                "prediction, but the disease could not be identified "
                "with sufficient confidence."
            ),

            **common

        }

        if possible_condition:

            response["possible_condition"] = possible_condition

            response["possible_condition_confidence"] = (
                possible_confidence
            )

        return response

    if status != "success":

        return {

            "detection_status": "unknown",

            "disease_detected": False,

            "message": "No reliable prediction is available.",

            **common

        }

    predicted_crop = result.get("crop")
    organ = result.get("organ")
    condition = result.get("condition")
    is_healthy = result.get("is_healthy")

    if not isinstance(predicted_crop, str):

        raise ValueError(
            "Model did not return a valid crop."
        )

    predicted_crop = predicted_crop.lower()

    if predicted_crop != selected_crop:

        return {

            "detection_status": "crop_mismatch",

            "disease_detected": False,

            "selected_crop": selected_crop,

            "predicted_crop": predicted_crop,

            "message": (
                "The detected crop does not match "
                "the selected crop. Please check your selection."
            ),

            **common

        }

    if is_healthy is True:

        return {

            "detection_status": "success",

            "disease_detected": False,

            "plant_health": "healthy",

            "crop": predicted_crop,

            "plant_part": organ,

            "confidence": confidence,

            "message": (
                "The model classified this image "
                "as a healthy plant condition."
            ),

            **common

        }

    if not isinstance(condition, str) or not condition:

        raise ValueError(
            "Model did not return a valid disease condition."
        )

    return {

        "detection_status": "success",

        "disease_detected": True,

        "crop": predicted_crop,

        "plant_part": organ,

        "disease": condition.replace(
            "_", " "
        ).title(),

        "confidence": confidence,

        "message": "A possible disease condition was identified.",

        "disclaimer": (
            "This is an AI-generated estimate, not a confirmed "
            "plant diagnosis. Consult a qualified agricultural "
            "expert before making treatment decisions."
        ),

        **common

    }


# ==========================================
# DISEASE PREDICTION API
# ==========================================

@app.post("/predict")
async def predict_disease(
    crop: str = Query(...),
    image: UploadFile = File(...)
):

    selected_crop, prediction = await run_model_prediction(
        crop,
        image
    )

    formatted_result = format_prediction(
        prediction,
        selected_crop
    )

    return {

        "success": True,

        "selected_crop": selected_crop,

        **formatted_result

    }


# ==========================================
# MODEL DIAGNOSTICS API
# ==========================================

@app.post("/debug-predict")
async def debug_predict_disease(
    crop: str = Query(...),
    image: UploadFile = File(...)
):

    selected_crop, prediction = await run_model_prediction(
        crop,
        image
    )

    diagnostic_fields = [

        "status",
        "message",
        "predicted_class",
        "crop",
        "organ",
        "condition",
        "is_healthy",
        "confidence",
        "top_predictions",
        "crop_probabilities",
        "model_version",
        "inference_ms"

    ]

    diagnostics = {

        key: prediction[key]

        for key in diagnostic_fields

        if key in prediction

    }

    return {

        "success": True,

        "selected_crop": selected_crop,

        "diagnostics": diagnostics

    }
