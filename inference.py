
"""
AgriSense BD - Memory Optimized Lazy Model Loading
Version: 2.1.0

Rice:
    wambugu71/crop_leaf_diseases_vit

Potato, Tomato, Maize:
    neghani/plantvillage-mobilenetv2

Only one model group is kept in memory at a time.
"""

import gc
import re
import time
import threading
from io import BytesIO
from dataclasses import dataclass

import torch
from PIL import Image, ImageOps, UnidentifiedImageError

from transformers import (
    AutoImageProcessor,
    AutoModelForImageClassification,
)


# ==========================================
# CONFIGURATION
# ==========================================

RICE_MODEL_REPO = "wambugu71/crop_leaf_diseases_vit"
GENERAL_MODEL_REPO = "neghani/plantvillage-mobilenetv2"

SUPPORTED_CROPS = ["rice", "potato", "tomato", "maize"]

CONFIDENCE_THRESHOLD = 0.70
DEVICE = torch.device("cpu")
MODEL_VERSION = "2.1.0"

GENERAL_CROPS = {"potato", "tomato", "maize"}

# Reduce CPU thread usage on small instances.
try:
    torch.set_num_threads(1)
except RuntimeError:
    pass

try:
    torch.set_num_interop_threads(1)
except RuntimeError:
    pass


# ==========================================
# CUSTOM EXCEPTION
# ==========================================

class InvalidImageError(Exception):
    pass


# ==========================================
# MODEL DATA STRUCTURE
# ==========================================

@dataclass
class LoadedModel:
    repo_id: str
    processor: object
    model: object
    id2label: dict
    crops: list
    version: str


# ==========================================
# CROP NAME NORMALIZATION
# ==========================================

def normalize_crop_name(value):

    if value is None:
        return None

    value = str(value).strip().lower()
    value = value.replace("_", " ")
    value = value.replace("-", " ")

    if "potato" in value:
        return "potato"

    if "tomato" in value:
        return "tomato"

    if "rice" in value:
        return "rice"

    if "maize" in value or "corn" in value:
        return "maize"

    return None


# ==========================================
# LABEL PARSER
# ==========================================

def split_label(label):

    label = str(label).strip()

    separators = ["___", "|", "::", "/"]

    for separator in separators:

        if separator in label:
            parts = label.split(separator, 1)

            return (
                parts[0].strip(),
                parts[1].strip()
            )

    lower_label = label.lower()

    crop_words = [
        "potato",
        "tomato",
        "rice",
        "maize",
        "corn"
    ]

    for crop_word in crop_words:

        if crop_word in lower_label:

            condition = re.sub(
                re.escape(crop_word),
                "",
                label,
                flags=re.IGNORECASE
            )

            condition = condition.strip(" _-()")

            return crop_word, condition or label

    return None, label


# ==========================================
# CONDITION FORMATTER
# ==========================================

def clean_condition(condition):

    condition = str(condition).replace("_", " ")

    condition = re.sub(r"\s+", " ", condition)

    return condition.strip().title()


# ==========================================
# HEALTHY CONDITION CHECK
# ==========================================

def is_healthy_condition(condition):

    if not condition:
        return False

    return "healthy" in str(condition).lower()


# ==========================================
# LOAD ONE MODEL
# ==========================================

def load_one_model(repo_id):

    print("\nLoading model:", repo_id, flush=True)

    processor = AutoImageProcessor.from_pretrained(repo_id)

    model = AutoModelForImageClassification.from_pretrained(
        repo_id
    )

    model.to(DEVICE)
    model.eval()

    raw_labels = model.config.id2label

    id2label = {
        int(index): str(label)
        for index, label in raw_labels.items()
    }

    recognized_crops = set()

    for label in id2label.values():

        crop_part, _ = split_label(label)

        crop_name = normalize_crop_name(crop_part)

        if crop_name:
            recognized_crops.add(crop_name)

    if not recognized_crops:

        raise RuntimeError(
            f"No supported crop labels found in {repo_id}. "
            f"Labels: {list(id2label.values())[:10]}"
        )

    print("Model loaded:", repo_id, flush=True)
    print("Classes:", len(id2label), flush=True)
    print("Recognized crops:", sorted(recognized_crops), flush=True)

    return LoadedModel(
        repo_id=repo_id,
        processor=processor,
        model=model,
        id2label=id2label,
        crops=sorted(recognized_crops),
        version=repo_id
    )


# ==========================================
# MEMORY-OPTIMIZED MODEL MANAGER
# ==========================================

class AgriSenseModels:

    def __init__(self):

        self.version = MODEL_VERSION
        self.crops = SUPPORTED_CROPS

        # Only one model group is retained.
        self.active_model = None
        self.active_group = None

        self._lock = threading.RLock()

    @property
    def is_model_loaded(self):

        return self.active_model is not None

    @property
    def loaded_model_group(self):

        return self.active_group

    def _release_active_model(self):

        if self.active_model is not None:

            print(
                "Releasing previous model:",
                self.active_group,
                flush=True
            )

        self.active_model = None
        self.active_group = None

        gc.collect()

    def _load_group(self, group):

        # Do not reload an already active model.
        if (
            self.active_model is not None
            and self.active_group == group
        ):
            return self.active_model

        # Release the old model before loading another.
        self._release_active_model()

        if group == "rice":

            new_model = load_one_model(
                RICE_MODEL_REPO
            )

            if "rice" not in new_model.crops:

                del new_model
                gc.collect()

                raise RuntimeError(
                    "Rice model does not contain Rice classes."
                )

        elif group == "general":

            new_model = load_one_model(
                GENERAL_MODEL_REPO
            )

            missing = GENERAL_CROPS - set(new_model.crops)

            if missing:

                del new_model
                gc.collect()

                raise RuntimeError(
                    "General model is missing required crops: "
                    + ", ".join(sorted(missing))
                )

        else:

            raise ValueError(
                f"Unsupported model group: {group}"
            )

        # Assign only after successful loading and validation.
        self.active_model = new_model
        self.active_group = group

        print(
            "Active model group:",
            group,
            flush=True
        )

        return self.active_model

    def model_for_crop(self, crop):

        crop = str(crop).strip().lower()

        if crop not in SUPPORTED_CROPS:

            raise ValueError(
                f"Unsupported crop: {crop}"
            )

        group = (
            "rice"
            if crop == "rice"
            else "general"
        )

        with self._lock:
            return self._load_group(group)


# ==========================================
# MODEL INITIALIZATION
# ==========================================

def load_model(model_dir=None):

    """
    Initialize only the lightweight model manager.

    Actual Hugging Face model weights are loaded
    on the first prediction for the selected crop.
    """

    print("\n================================", flush=True)
    print("Initializing AgriSense ML Manager", flush=True)
    print("Lazy model loading enabled", flush=True)
    print("================================", flush=True)

    manager = AgriSenseModels()

    print("Model manager initialized.", flush=True)
    print("Supported crops:", SUPPORTED_CROPS, flush=True)
    print("Device:", DEVICE, flush=True)
    print("Version:", MODEL_VERSION, flush=True)

    return manager


# ==========================================
# IMAGE LOADER
# ==========================================

def load_image(source):

    try:

        if isinstance(source, bytes):

            image = Image.open(
                BytesIO(source)
            )

        else:

            image = Image.open(source)

        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")

        return image

    except (
        UnidentifiedImageError,
        OSError,
        ValueError
    ) as error:

        raise InvalidImageError(
            "The uploaded file is not a valid image."
        ) from error


# ==========================================
# IMAGE PREDICTION
# ==========================================

def predict_image(source, model_bundle, crop="rice"):

    return predict_image_for_crop(
        source,
        model_bundle,
        crop
    )


# ==========================================
# CROP-AWARE PREDICTION
# ==========================================

def predict_image_for_crop(
    source,
    model_bundle,
    selected_crop
):

    started = time.perf_counter()

    selected_crop = str(
        selected_crop
    ).strip().lower()

    if selected_crop not in SUPPORTED_CROPS:

        raise ValueError(
            f"Unsupported crop: {selected_crop}"
        )

    if model_bundle is None:

        raise RuntimeError(
            "Model manager has not been initialized."
        )

    image = load_image(source)

    # Loads only the required model group.
    selected_model = model_bundle.model_for_crop(
        selected_crop
    )

    inputs = selected_model.processor(
        images=image,
        return_tensors="pt"
    )

    with torch.inference_mode():

        outputs = selected_model.model(
            **inputs
        )

        probabilities = torch.softmax(
            outputs.logits[0],
            dim=-1
        )

    ranked_indices = torch.argsort(
        probabilities,
        descending=True
    ).tolist()

    crop_probabilities = {}
    all_predictions = []

    for class_index, probability_tensor in enumerate(
        probabilities
    ):

        raw_label = selected_model.id2label.get(
            class_index,
            f"class_{class_index}"
        )

        crop_part, condition_part = split_label(
            raw_label
        )

        detected_crop = normalize_crop_name(
            crop_part
        )

        confidence = float(
            probability_tensor.item()
        )

        if detected_crop:

            crop_probabilities[detected_crop] = (
                crop_probabilities.get(
                    detected_crop,
                    0.0
                ) + confidence
            )

            formatted_class = (
                f"{detected_crop}|{condition_part}"
            )

        else:

            formatted_class = str(raw_label)

        all_predictions.append({

            "class": formatted_class,

            "display_name": clean_condition(
                condition_part
            ),

            "crop": detected_crop,

            "confidence": round(
                confidence,
                6
            )

        })

    top_predictions = [

        all_predictions[index]

        for index in ranked_indices[:5]

    ]

    top_prediction = top_predictions[0]

    predicted_crop = top_prediction.get("crop")
    condition = top_prediction.get("display_name")

    confidence = top_prediction.get(
        "confidence",
        0.0
    )

    dominant_crop = None

    if crop_probabilities:

        dominant_crop = max(
            crop_probabilities,
            key=crop_probabilities.get
        )

    inference_ms = round(
        (time.perf_counter() - started) * 1000,
        2
    )

    common = {

        "model_version": selected_model.version,

        "inference_ms": inference_ms,

        "crop_probabilities": {
            key: round(value, 6)
            for key, value in crop_probabilities.items()
        },

        "top_predictions": top_predictions,

        "predicted_class": top_prediction["class"],

        "confidence": round(confidence, 6),

        "organ": "leaf"

    }

    # ======================================
    # CROP MISMATCH
    # ======================================

    if (
        dominant_crop is not None
        and dominant_crop != selected_crop
        and crop_probabilities[dominant_crop]
        > crop_probabilities.get(selected_crop, 0.0)
    ):

        return {

            "status": "unknown",

            "message": (
                "The image may belong to a different crop."
            ),

            "crop": predicted_crop,

            "condition": condition,

            "is_healthy": False,

            **common

        }

    if predicted_crop != selected_crop:

        return {

            "status": "unknown",

            "message": (
                "The selected crop could not be reliably confirmed."
            ),

            "crop": predicted_crop,

            "condition": condition,

            "is_healthy": False,

            **common

        }

    # ======================================
    # LOW CONFIDENCE
    # ======================================

    if confidence < CONFIDENCE_THRESHOLD:

        return {

            "status": "uncertain",

            "message": (
                "Model confidence is below the configured threshold."
            ),

            "crop": selected_crop,

            "condition": condition,

            "is_healthy": is_healthy_condition(
                condition
            ),

            **common

        }

    # ======================================
    # HEALTHY / DISEASE CLASSIFICATION
    # ======================================

    healthy = is_healthy_condition(
        condition
    )

    return {

        "status": "success",

        "crop": selected_crop,

        "organ": "leaf",

        "condition": condition,

        "is_healthy": healthy,

        **common

    }


# ==========================================
# MULTI-IMAGE PLANT ASSESSMENT
# ==========================================

def assess_plant(
    sources,
    model_bundle,
    crop="rice"
):

    if not isinstance(sources, (list, tuple)):
        sources = [sources]

    results = []

    for source in sources:

        result = predict_image(
            source,
            model_bundle,
            crop
        )

        results.append(result)

    return {
        "total_images": len(results),
        "results": results
    }


# ==========================================
# MODULE INFORMATION
# ==========================================

def get_model_information(model_bundle):

    if model_bundle is None:

        return {
            "loaded": False
        }

    return {

        "loaded": model_bundle.is_model_loaded,

        "version": model_bundle.version,

        "supported_crops": model_bundle.crops,

        "active_model_group": model_bundle.loaded_model_group,

        "rice_model": RICE_MODEL_REPO,

        "general_model": GENERAL_MODEL_REPO,

        "device": str(DEVICE),

        "confidence_threshold": CONFIDENCE_THRESHOLD

    }
