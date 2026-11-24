
const db = require("../config/db");

// GET: Expert-এর নিজের তৈরি Advice List
exports.getMyAdvice = async (req, res) => {
  try {
    const expertId = req.user.id;

    const [rows] = await db.query(
      `SELECT
          ea.id,
          ea.expert_id,
          ea.farmer_id,
          ea.farmer_crop_id,
          ea.title,
          ea.advice_text,
          ea.status,
          ea.created_at,
          ea.updated_at,
          u.full_name AS farmer_name,
          u.phone AS farmer_phone,
          c.crop_name
       FROM expert_advice ea
       JOIN users u ON ea.farmer_id = u.id
       LEFT JOIN farmer_crops fc
          ON ea.farmer_crop_id = fc.id
       LEFT JOIN crops c
          ON fc.crop_id = c.id
       WHERE ea.expert_id = ?
       ORDER BY ea.created_at DESC`,
      [expertId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get Expert Advice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expert advice.",
    });
  }
};


// POST: নতুন Advice তৈরি
exports.createAdvice = async (req, res) => {
  try {
    const expertId = req.user.id;

    const {
      farmer_id,
      farmer_crop_id,
      title,
      advice_text,
    } = req.body;

    if (!farmer_id || !title?.trim() || !advice_text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Farmer, advice title and advice details are required.",
      });
    }

    // Farmer account check
    const [farmers] = await db.query(
      `SELECT id
       FROM users
       WHERE id = ?
       AND role = 'FARMER'
       AND status = 'ACTIVE'
       LIMIT 1`,
      [farmer_id]
    );

    if (farmers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active farmer not found.",
      });
    }

    // Optional crop ownership check
    if (farmer_crop_id) {
      const [crops] = await db.query(
        `SELECT id
         FROM farmer_crops
         WHERE id = ?
         AND farmer_id = ?
         LIMIT 1`,
        [farmer_crop_id, farmer_id]
      );

      if (crops.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected crop does not belong to this farmer.",
        });
      }
    }

    const [result] = await db.query(
      `INSERT INTO expert_advice
        (
          expert_id,
          farmer_id,
          farmer_crop_id,
          title,
          advice_text,
          status
        )
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [
        expertId,
        farmer_id,
        farmer_crop_id || null,
        title.trim(),
        advice_text.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Expert advice created successfully.",
      advice_id: result.insertId,
    });
  } catch (error) {
    console.error("Create Expert Advice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expert advice.",
    });
  }
};


// PUT: নিজের Advice Update
exports.updateAdvice = async (req, res) => {
  try {
    const expertId = req.user.id;
    const adviceId = req.params.id;

    const {
      farmer_id,
      farmer_crop_id,
      title,
      advice_text,
      status,
    } = req.body;

    if (!farmer_id || !title?.trim() || !advice_text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Farmer, title and advice details are required.",
      });
    }

    const allowedStatuses = ["PENDING", "READ", "RESOLVED"];

    const normalizedStatus = String(status || "PENDING").toUpperCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid advice status.",
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM expert_advice
       WHERE id = ?
       AND expert_id = ?
       LIMIT 1`,
      [adviceId, expertId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Advice not found or you do not have permission.",
      });
    }

    const [farmers] = await db.query(
      `SELECT id
       FROM users
       WHERE id = ?
       AND role = 'FARMER'
       AND status = 'ACTIVE'
       LIMIT 1`,
      [farmer_id]
    );

    if (farmers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active farmer not found.",
      });
    }

    if (farmer_crop_id) {
      const [crops] = await db.query(
        `SELECT id
         FROM farmer_crops
         WHERE id = ?
         AND farmer_id = ?
         LIMIT 1`,
        [farmer_crop_id, farmer_id]
      );

      if (crops.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected crop does not belong to this farmer.",
        });
      }
    }

    await db.query(
      `UPDATE expert_advice
       SET
          farmer_id = ?,
          farmer_crop_id = ?,
          title = ?,
          advice_text = ?,
          status = ?
       WHERE id = ?
       AND expert_id = ?`,
      [
        farmer_id,
        farmer_crop_id || null,
        title.trim(),
        advice_text.trim(),
        normalizedStatus,
        adviceId,
        expertId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Expert advice updated successfully.",
    });
  } catch (error) {
    console.error("Update Expert Advice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expert advice.",
    });
  }
};


// DELETE: নিজের Advice Delete
exports.deleteAdvice = async (req, res) => {
  try {
    const expertId = req.user.id;
    const adviceId = req.params.id;

    const [result] = await db.query(
      `DELETE FROM expert_advice
       WHERE id = ?
       AND expert_id = ?`,
      [adviceId, expertId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Advice not found or you do not have permission.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expert advice deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Expert Advice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete expert advice.",
    });
  }
};
