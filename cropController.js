
const db = require("../config/db");

// Get all active crops
exports.getAllCrops = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, crop_name, description,
              farming_information, image_url
       FROM crops
       WHERE is_active = 1
       ORDER BY crop_name ASC`
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });
  } catch (error) {
    console.error("Get Crops Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve crop information"
    });
  }
};

// Get one crop with its disease information
exports.getCropDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [crops] = await db.query(
      `SELECT id, crop_name, description,
              farming_information, image_url
       FROM crops
       WHERE id = ? AND is_active = 1`,
      [id]
    );

    if (!crops.length) {
      return res.status(404).json({
        success: false,
        message: "Crop not found"
      });
    }

    const [diseases] = await db.query(
      `SELECT id, disease_name, symptoms,
              possible_causes, management_recommendations,
              prevention_information
       FROM disease_information
       WHERE crop_id = ?
       ORDER BY disease_name ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      crop: crops[0],
      total_diseases: diseases.length,
      diseases
    });
  } catch (error) {
    console.error("Crop Details Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve crop details"
    });
  }
};

// Get disease information for a crop
exports.getCropDiseases = async (req, res) => {
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

    const [diseases] = await db.query(
      `SELECT id, disease_name, symptoms,
              possible_causes, management_recommendations,
              prevention_information
       FROM disease_information
       WHERE crop_id = ?
       ORDER BY disease_name ASC`,
      [cropId]
    );

    res.status(200).json({
      success: true,
      crop: crops[0],
      total: diseases.length,
      data: diseases
    });
  } catch (error) {
    console.error("Crop Diseases Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve disease information"
    });
  }
};

// Admin adds disease information
exports.addDisease = async (req, res) => {
  try {
    const {
      crop_id,
      disease_name,
      symptoms,
      possible_causes,
      management_recommendations,
      prevention_information
    } = req.body;

    if (
      !crop_id ||
      !disease_name ||
      !symptoms ||
      !management_recommendations
    ) {
      return res.status(400).json({
        success: false,
        message: "Crop, disease name, symptoms and management recommendations are required"
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
      `INSERT INTO disease_information
       (crop_id, disease_name, symptoms, possible_causes,
        management_recommendations, prevention_information)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crop_id,
        disease_name,
        symptoms,
        possible_causes || null,
        management_recommendations,
        prevention_information || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Disease information added successfully",
      disease_id: result.insertId
    });
  } catch (error) {
    console.error("Add Disease Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add disease information"
    });
  }
};

// Admin updates disease information
exports.updateDisease = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      disease_name,
      symptoms,
      possible_causes,
      management_recommendations,
      prevention_information
    } = req.body;

    const [result] = await db.query(
      `UPDATE disease_information
       SET disease_name = COALESCE(?, disease_name),
           symptoms = COALESCE(?, symptoms),
           possible_causes = COALESCE(?, possible_causes),
           management_recommendations =
             COALESCE(?, management_recommendations),
           prevention_information =
             COALESCE(?, prevention_information)
       WHERE id = ?`,
      [
        disease_name || null,
        symptoms || null,
        possible_causes || null,
        management_recommendations || null,
        prevention_information || null,
        id
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Disease information not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Disease information updated successfully"
    });
  } catch (error) {
    console.error("Update Disease Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update disease information"
    });
  }
};

// Admin deletes disease information
exports.deleteDisease = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM disease_information WHERE id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Disease information not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Disease information deleted successfully"
    });
  } catch (error) {
    console.error("Delete Disease Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete disease information"
    });
  }
};
