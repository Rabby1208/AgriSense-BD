
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ==========================================
// ADMIN PROFILE
// ==========================================

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.phone, u.role,
              ap.designation
       FROM users u
       LEFT JOIN admin_profiles ap ON u.id = ap.user_id
       WHERE u.id = ? AND u.role = 'ADMIN'`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Admin Profile Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin profile"
    });
  }
};

// ==========================================
// ADMIN DASHBOARD
// ==========================================

exports.getDashboard = async (req, res) => {
  try {
    const [farmers] = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'FARMER'"
    );

    const [experts] = await db.query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE role = 'AGRI_EXPERT' AND is_active = 1`
    );

    const [crops] = await db.query(
      "SELECT COUNT(*) AS total FROM crops WHERE is_active = 1"
    );

    const [inactive] = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE is_active = 0"
    );

    res.status(200).json({
      success: true,
      data: {
        total_farmers: farmers[0].total,
        total_active_experts: experts[0].total,
        total_active_crops: crops[0].total,
        inactive_accounts: inactive[0].total
      }
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard"
    });
  }
};

// ==========================================
// CREATE AGRI EXPERT
// ==========================================

exports.createExpert = async (req, res) => {
  let connection;

  try {
    const {
      full_name,
      phone,
      password,
      qualification,
      experience_years,
      bio,
      contact_information
    } = req.body;

    const expertise =
      typeof req.body.expertise === "string" &&
      req.body.expertise.trim()
        ? req.body.expertise.trim()
        : "General Agriculture";

    if (
      typeof full_name !== "string" ||
      !full_name.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone and password are required"
      });
    }

    const cleanName = full_name.trim();
    const cleanPhone = phone.trim();

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    if (
      experience_years !== undefined &&
      (!Number.isInteger(Number(experience_years)) ||
        Number(experience_years) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience years must be a non-negative whole number"
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE phone = ?",
      [cleanPhone]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    connection = await db.getConnection();

    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `INSERT INTO users
       (full_name, phone, password_hash, role)
       VALUES (?, ?, ?, 'AGRI_EXPERT')`,
      [cleanName, cleanPhone, passwordHash]
    );

    await connection.query(
      `INSERT INTO expert_profiles
       (user_id, expertise, qualification, experience_years,
        bio, contact_information)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        expertise,
        qualification || null,
        experience_years || 0,
        bio || null,
        contact_information || null
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Agri Expert account created successfully",
      expert_id: userResult.insertId,
      expertise
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Create Expert Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expert account"
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ==========================================
// GET ALL EXPERTS
// ==========================================

exports.getExperts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.phone, u.is_active,
              ep.expertise, ep.qualification,
              ep.experience_years, ep.bio,
              ep.contact_information
       FROM users u
       JOIN expert_profiles ep ON u.id = ep.user_id
       WHERE u.role = 'AGRI_EXPERT'
       ORDER BY u.id DESC`
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });
  } catch (error) {
    console.error("Get Experts Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve experts"
    });
  }
};

// ==========================================
// UPDATE EXPERT INFORMATION
// ==========================================

exports.updateExpert = async (req, res) => {
  let connection;

  try {
    const { id } = req.params;

    const {
      full_name,
      phone,
      expertise,
      qualification,
      experience_years,
      bio,
      contact_information
    } = req.body;

    const [experts] = await db.query(
      `SELECT id FROM users
       WHERE id = ? AND role = 'AGRI_EXPERT'`,
      [id]
    );

    if (!experts.length) {
      return res.status(404).json({
        success: false,
        message: "Expert not found"
      });
    }

    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number"
      });
    }

    if (
      experience_years !== undefined &&
      (!Number.isInteger(Number(experience_years)) ||
        Number(experience_years) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience years must be a non-negative whole number"
      });
    }

    if (phone) {
      const [duplicate] = await db.query(
        "SELECT id FROM users WHERE phone = ? AND id != ?",
        [phone, id]
      );

      if (duplicate.length) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists"
        });
      }
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    await connection.query(
      `UPDATE users
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone)
       WHERE id = ?`,
      [full_name || null, phone || null, id]
    );

    await connection.query(
      `UPDATE expert_profiles
       SET expertise = COALESCE(?, expertise),
           qualification = COALESCE(?, qualification),
           experience_years = COALESCE(?, experience_years),
           bio = COALESCE(?, bio),
           contact_information = COALESCE(?, contact_information)
       WHERE user_id = ?`,
      [
        expertise || null,
        qualification || null,
        experience_years === undefined ? null : experience_years,
        bio || null,
        contact_information || null,
        id
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Expert information updated successfully"
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Update Expert Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update expert information"
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ==========================================
// ACTIVATE / DEACTIVATE EXPERT
// ==========================================

exports.updateExpertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (![0, 1, true, false].includes(is_active)) {
      return res.status(400).json({
        success: false,
        message: "is_active must be 0 or 1"
      });
    }

    const [result] = await db.query(
      `UPDATE users
       SET is_active = ?
       WHERE id = ? AND role = 'AGRI_EXPERT'`,
      [Number(is_active), id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Expert not found"
      });
    }

    res.status(200).json({
      success: true,
      message: Number(is_active)
        ? "Expert account activated successfully"
        : "Expert account deactivated successfully"
    });
  } catch (error) {
    console.error("Expert Status Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update expert status"
    });
  }
};

// ==========================================
// ADMIN DISEASE DETECTION STATISTICS
// ==========================================

exports.getDiseaseDetectionStats = async (req, res) => {
  try {
    const [summary] = await db.query(
      `SELECT
         COUNT(*) AS total_detections,
         SUM(
           CASE
             WHEN LOWER(COALESCE(detection_status, '')) LIKE '%mismatch%'
             THEN 1 ELSE 0
           END
         ) AS crop_mismatch,
         SUM(
           CASE
             WHEN disease_detected = 1
              AND LOWER(COALESCE(detection_status, '')) NOT LIKE '%mismatch%'
             THEN 1 ELSE 0
           END
         ) AS disease_detected,
         SUM(
           CASE
             WHEN disease_detected = 0
              AND LOWER(COALESCE(detection_status, '')) NOT LIKE '%mismatch%'
             THEN 1 ELSE 0
           END
         ) AS no_disease
       FROM disease_detection_history`
    );

    const [cropStats] = await db.query(
      `SELECT crop_name, COUNT(*) AS total_detections
       FROM disease_detection_history
       GROUP BY crop_name
       ORDER BY total_detections DESC`
    );

    const [diseaseStats] = await db.query(
      `SELECT disease_name, COUNT(*) AS total_detections
       FROM disease_detection_history
       WHERE disease_name IS NOT NULL
         AND disease_name != ''
         AND LOWER(COALESCE(detection_status, '')) NOT LIKE '%mismatch%'
       GROUP BY disease_name
       ORDER BY total_detections DESC
       LIMIT 10`
    );

    const [recentDetections] = await db.query(
      `SELECT h.id, h.crop_name, h.disease_name,
              h.confidence, h.detection_status,
              h.disease_detected, h.created_at,
              u.full_name AS farmer_name
       FROM disease_detection_history h
       JOIN users u ON h.farmer_id = u.id
       ORDER BY h.created_at DESC
       LIMIT 5`
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_detections: Number(summary[0].total_detections) || 0,
          disease_detected: Number(summary[0].disease_detected) || 0,
          no_disease: Number(summary[0].no_disease) || 0,
          crop_mismatch: Number(summary[0].crop_mismatch) || 0
        },
        crop_statistics: cropStats,
        top_diseases: diseaseStats,
        recent_detections: recentDetections
      }
    });
  } catch (error) {
    console.error("Admin Disease Stats Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve disease detection statistics"
    });
  }
};

// ==========================================
// ADMIN DISEASE DETECTION HISTORY
// ==========================================

exports.getDiseaseDetectionHistory = async (req, res) => {
  try {
    const {
      farmerId,
      cropName,
      status,
      startDate,
      endDate
    } = req.query;

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const requestedOffset = Number.parseInt(req.query.offset, 10);

    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 20;

    const offset = Number.isInteger(requestedOffset)
      ? Math.max(requestedOffset, 0)
      : 0;

    const conditions = [];
    const params = [];

    if (farmerId !== undefined && farmerId !== "") {
      if (!/^\d+$/.test(String(farmerId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmer ID"
        });
      }

      conditions.push("h.farmer_id = ?");
      params.push(Number(farmerId));
    }

    if (cropName) {
      conditions.push("LOWER(h.crop_name) = LOWER(?)");
      params.push(cropName);
    }

    if (status) {
      const normalizedStatus = String(status).toLowerCase();

      if (normalizedStatus === "crop_mismatch") {
        conditions.push(
          "LOWER(COALESCE(h.detection_status, '')) LIKE '%mismatch%'"
        );
      } else if (normalizedStatus === "disease_detected") {
        conditions.push(
          `h.disease_detected = 1
           AND LOWER(COALESCE(h.detection_status, '')) NOT LIKE '%mismatch%'`
        );
      } else if (normalizedStatus === "no_disease") {
        conditions.push(
          `h.disease_detected = 0
           AND LOWER(COALESCE(h.detection_status, '')) NOT LIKE '%mismatch%'`
        );
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter"
        });
      }
    }

    if (startDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return res.status(400).json({
          success: false,
          message: "startDate must use YYYY-MM-DD format"
        });
      }

      conditions.push("DATE(h.created_at) >= ?");
      params.push(startDate);
    }

    if (endDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: "endDate must use YYYY-MM-DD format"
        });
      }

      conditions.push("DATE(h.created_at) <= ?");
      params.push(endDate);
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be later than endDate"
      });
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [rows] = await db.query(
      `SELECT
         h.id,
         h.farmer_id,
         u.full_name AS farmer_name,
         u.phone AS farmer_phone,
         h.crop_name,
         h.disease_name,
         h.confidence,
         h.detection_status,
         h.disease_detected,
         h.prediction_result,
         h.created_at
       FROM disease_detection_history h
       JOIN users u ON h.farmer_id = u.id
       ${whereClause}
       ORDER BY h.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM disease_detection_history h
       JOIN users u ON h.farmer_id = u.id
       ${whereClause}`,
      params
    );

    res.status(200).json({
      success: true,
      total: Number(countRows[0].total) || 0,
      limit,
      offset,
      data: rows
    });
  } catch (error) {
    console.error("Admin Disease History Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve disease detection history"
    });
  }
};
