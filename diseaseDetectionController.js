
const db = require("../config/db");

function extractDiseaseName(result) {
  if (result.detection_status === "crop_mismatch") {
    return null;
  }

  return (
    result.disease_name ||
    result.predicted_disease ||
    result.predicted_class ||
    result.class_name ||
    result.condition ||
    result.disease ||
    result.label ||
    result.prediction?.disease_name ||
    result.prediction?.label ||
    null
  );
}

exports.predictDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A leaf image is required",
      });
    }

    const { crop } = req.body;

    const allowedCrops = [
      "Rice",
      "Potato",
      "Tomato",
      "Maize",
    ];

    if (!crop || !allowedCrops.includes(crop)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid crop",
      });
    }

    const formData = new FormData();

    const imageBlob = new Blob(
      [req.file.buffer],
      { type: req.file.mimetype }
    );

    formData.append(
      "image",
      imageBlob,
      req.file.originalname
    );

    const mlServiceUrl =
      process.env.ML_SERVICE_URL ||
      "http://127.0.0.1:8000";

    const response = await fetch(
      `${mlServiceUrl}/predict?crop=${encodeURIComponent(crop)}`,
      {
        method: "POST",
        body: formData,
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      return res.status(502).json({
        success: false,
        message: "Invalid response received from ML service.",
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message:
          result.detail ||
          result.message ||
          "ML prediction failed",
      });
    }

    const diseaseName = extractDiseaseName(result);

    const confidence =
      result.confidence !== undefined &&
      result.confidence !== null &&
      Number.isFinite(Number(result.confidence))
        ? Number(result.confidence)
        : null;

    const detectionStatus =
      result.detection_status ||
      result.status ||
      "unknown";

    const diseaseDetected =
      typeof result.disease_detected === "boolean"
        ? result.disease_detected
          ? 1
          : 0
        : null;

    try {
      await db.query(
        `INSERT INTO disease_detection_history
        (
          farmer_id,
          crop_name,
          disease_name,
          confidence,
          detection_status,
          disease_detected,
          prediction_result
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          crop,
          diseaseName,
          confidence,
          detectionStatus,
          diseaseDetected,
          JSON.stringify(result),
        ]
      );
    } catch (databaseError) {
      console.error(
        "Disease History Save Error:",
        databaseError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Prediction completed, but history could not be saved.",
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error(
      "Disease Detection Error:",
      error.message
    );

    return res.status(503).json({
      success: false,
      message:
        "Local ML service is unavailable. Please start the ML service.",
    });
  }
};
