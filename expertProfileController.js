
const db = require("../config/db");

// ==========================================
// GET MY EXPERT PROFILE
// ==========================================

exports.getMyProfile = async (req, res) => {
  try {
    const expertId = Number(req.user.id);

    const [rows] = await db.query(
      `SELECT
        u.id,
        u.full_name,
        u.phone,
        u.is_active,
        ep.expertise,
        ep.qualification,
        ep.experience_years,
        ep.bio,
        ep.contact_information
       FROM users u
       LEFT JOIN expert_profiles ep ON ep.user_id = u.id
       WHERE u.id = ?
       AND u.role = 'AGRI_EXPERT'
       LIMIT 1`,
      [expertId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Expert profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("GET EXPERT PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load expert profile.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE MY EXPERT PROFILE
// ==========================================

exports.updateMyProfile = async (req, res) => {
  let connection;

  try {
    const expertId = Number(req.user.id);

    const {
      full_name,
      phone,
      expertise,
      qualification,
      experience_years,
      bio,
      contact_information,
    } = req.body;

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    const experience =
      experience_years === "" ||
      experience_years === null ||
      experience_years === undefined
        ? null
        : Number(experience_years);

    if (
      experience !== null &&
      (!Number.isInteger(experience) || experience < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a valid non-negative number.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT id
       FROM users
       WHERE id = ?
       AND role = 'AGRI_EXPERT'
       AND is_active = 1`,
      [expertId]
    );

    if (!existing.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Active expert account not found.",
      });
    }

    const [phoneOwner] = await connection.query(
      `SELECT id
       FROM users
       WHERE phone = ?
       AND id <> ?
       LIMIT 1`,
      [String(phone).trim(), expertId]
    );

    if (phoneOwner.length) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "This phone number is already in use.",
      });
    }

    await connection.query(
      `UPDATE users
       SET full_name = ?,
           phone = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       AND role = 'AGRI_EXPERT'`,
      [
        String(full_name).trim(),
        String(phone).trim(),
        expertId,
      ]
    );

    await connection.query(
      `INSERT INTO expert_profiles
       (
         user_id,
         expertise,
         qualification,
         experience_years,
         bio,
         contact_information
       )
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         expertise = VALUES(expertise),
         qualification = VALUES(qualification),
         experience_years = VALUES(experience_years),
         bio = VALUES(bio),
         contact_information = VALUES(contact_information)`,
      [
        expertId,
        expertise || null,
        qualification || null,
        experience,
        bio || null,
        contact_information || null,
      ]
    );

    await connection.commit();

    const [updated] = await connection.query(
      `SELECT
        u.id,
        u.full_name,
        u.phone,
        ep.expertise,
        ep.qualification,
        ep.experience_years,
        ep.bio,
        ep.contact_information
       FROM users u
       LEFT JOIN expert_profiles ep ON ep.user_id = u.id
       WHERE u.id = ?`,
      [expertId]
    );

    return res.status(200).json({
      success: true,
      message: "Expert profile updated successfully.",
      data: updated[0],
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("UPDATE EXPERT PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expert profile.",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
