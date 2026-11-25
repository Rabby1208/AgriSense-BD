
const db = require("../config/db");

// Get recommendations for a crop
exports.getRecommendations = async (req, res) => {
  try {
    const { cropId } = req.params;

    const [crops] = await db.query(
      "SELECT id, crop_name FROM crops WHERE id = ? AND is_active = 1",
      [cropId]
    );

    if (!crops.length) {
      return res.status(404).json({
        success: false,
        message: "Crop not found"
      });
    }

    const [recommendations] = await db.query(
      `SELECT fertilizer_name, quantity_per_acre,
              quantity_unit, application_guidance,
              source_reference
       FROM fertilizer_recommendations
       WHERE crop_id = ?
       ORDER BY fertilizer_name`,
      [cropId]
    );

    return res.status(200).json({
      success: true,
      crop: crops[0],
      total: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error("Get Fertilizer Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve fertilizer recommendations"
    });
  }
};

// Calculate fertilizer quantity according to land area
exports.calculateFertilizer = async (req, res) => {
  try {
    const { crop_id, land_area, land_unit } = req.query;

    if (!crop_id || land_area === undefined || !land_unit) {
      return res.status(400).json({
        success: false,
        message: "Crop, land area and land unit are required"
      });
    }

    const area = Number(land_area);

    if (!Number.isFinite(area) || area <= 0) {
      return res.status(400).json({
        success: false,
        message: "Land area must be greater than zero"
      });
    }

    if (!["DECIMAL", "ACRE"].includes(land_unit)) {
      return res.status(400).json({
        success: false,
        message: "Land unit must be DECIMAL or ACRE"
      });
    }

    const [crops] = await db.query(
      "SELECT id, crop_name FROM crops WHERE id = ? AND is_active = 1",
      [crop_id]
    );

    if (!crops.length) {
      return res.status(404).json({
        success: false,
        message: "Crop not found"
      });
    }

    const areaInAcres =
      land_unit === "DECIMAL" ? area / 100 : area;

    const [recommendations] = await db.query(
      `SELECT fertilizer_name, quantity_per_acre,
              quantity_unit, application_guidance,
              source_reference
       FROM fertilizer_recommendations
       WHERE crop_id = ?`,
      [crop_id]
    );

    if (!recommendations.length) {
      return res.status(404).json({
        success: false,
        message: "No verified fertilizer recommendation is available for this crop yet"
      });
    }

    const results = recommendations.map((item) => ({
      fertilizer_name: item.fertilizer_name,
      recommended_per_acre: Number(item.quantity_per_acre),
      required_quantity:
        Number(
          (Number(item.quantity_per_acre) * areaInAcres).toFixed(3)
        ),
      unit: item.quantity_unit,
      application_guidance: item.application_guidance,
      source_reference: item.source_reference
    }));

    return res.status(200).json({
      success: true,
      crop: crops[0].crop_name,
      land_area: area,
      land_unit,
      land_area_in_acres: Number(areaInAcres.toFixed(4)),
      results,
      note: "Use recommendations only when their crop, location, season and soil conditions match your field. Consult a qualified agricultural expert."
    });
  } catch (error) {
    console.error("Fertilizer Calculation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Fertilizer calculation failed"
    });
  }
};

// Admin adds a verified recommendation
exports.addRecommendation = async (req, res) => {
  try {
    const {
      crop_id,
      fertilizer_name,
      quantity_per_acre,
      quantity_unit,
      application_guidance,
      source_reference
    } = req.body;

    if (
      !crop_id ||
      !fertilizer_name ||
      quantity_per_acre === undefined ||
      !quantity_unit ||
      !application_guidance ||
      !source_reference
    ) {
      return res.status(400).json({
        success: false,
        message: "All recommendation fields are required"
      });
    }

    const quantity = Number(quantity_per_acre);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity per acre must be greater than zero"
      });
    }

    const [crops] = await db.query(
      "SELECT id FROM crops WHERE id = ? AND is_active = 1",
      [crop_id]
    );

    if (!crops.length) {
      return res.status(404).json({
        success: false,
        message: "Crop not found"
      });
    }

    const [result] = await db.query(
      `INSERT INTO fertilizer_recommendations
       (crop_id, fertilizer_name, quantity_per_acre,
        quantity_unit, application_guidance, source_reference)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crop_id,
        fertilizer_name,
        quantity,
        quantity_unit,
        application_guidance,
        source_reference
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Fertilizer recommendation added successfully",
      recommendation_id: result.insertId
    });
  } catch (error) {
    console.error("Add Recommendation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to add fertilizer recommendation"
    });
  }
};

// Admin deletes a recommendation
exports.deleteRecommendation = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM fertilizer_recommendations WHERE id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recommendation deleted successfully"
    });
  } catch (error) {
    console.error("Delete Recommendation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete recommendation"
    });
  }
};
