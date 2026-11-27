const db = require("../config/db");

// ==========================================
// FARMER: Create a request for an Expert
// POST /api/farmer/requests
// ==========================================
exports.createRequest = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const {
      expert_id,
      title,
      category,
      problem_details,
      image_url,
    } = req.body || {};

    if (!expert_id || !title || !problem_details) {
      return res.status(400).json({
        success: false,
        message: "Expert, title and problem details are required.",
      });
    }

    if (
      !Number.isInteger(Number(expert_id)) ||
      Number(expert_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expert ID.",
      });
    }

    if (
      typeof title !== "string" ||
      typeof problem_details !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and problem details must be text.",
      });
    }

    if (
      category !== undefined &&
      category !== null &&
      typeof category !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Category must be text.",
      });
    }

    if (
      image_url !== undefined &&
      image_url !== null &&
      typeof image_url !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Image URL must be text.",
      });
    }

    const cleanTitle = title.trim();
    const cleanDetails = problem_details.trim();
    const cleanCategory = category ? category.trim() : null;
    const cleanImageUrl = image_url ? image_url.trim() : null;

    if (!cleanTitle || !cleanDetails) {
      return res.status(400).json({
        success: false,
        message: "Title and problem details cannot be empty.",
      });
    }

    if (cleanTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters.",
      });
    }

    // Confirm that the selected Expert is active.
    const [experts] = await db.query(
      `SELECT id
       FROM users
       WHERE id = ?
         AND role = 'AGRI_EXPERT'
         AND is_active = 1
       LIMIT 1`,
      [Number(expert_id)]
    );

    if (experts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected Expert was not found or is inactive.",
      });
    }

    // farmer_crop_id is NULL for now.
    // This avoids assuming an unverified farmer_crops ownership column.
    const [result] = await db.query(
      `INSERT INTO farmer_expert_requests (
        farmer_id,
        expert_id,
        farmer_crop_id,
        title,
        category,
        problem_details,
        image_url
      ) VALUES (?, ?, NULL, ?, ?, ?, ?)`,
      [
        farmerId,
        Number(expert_id),
        cleanTitle,
        cleanCategory || null,
        cleanDetails,
        cleanImageUrl || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Your problem has been sent to the Expert.",
      data: {
        id: result.insertId,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("Create Expert Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send your request.",
    });
  }
};

// ==========================================
// FARMER: View all own requests
// GET /api/farmer/requests
// ==========================================
exports.getMyRequests = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        r.id,
        r.title,
        r.category,
        r.problem_details,
        r.image_url,
        r.status,
        r.expert_response,
        r.responded_at,
        r.created_at,
        r.updated_at,
        r.farmer_crop_id,
        expert.full_name AS expert_name,
        expert.phone AS expert_phone,
        ep.expertise,
        ep.qualification,
        c.crop_name
      FROM farmer_expert_requests r
      JOIN users expert
        ON r.expert_id = expert.id
      LEFT JOIN expert_profiles ep
        ON expert.id = ep.user_id
      LEFT JOIN farmer_crops fc
        ON r.farmer_crop_id = fc.id
      LEFT JOIN crops c
        ON fc.crop_id = c.id
      WHERE r.farmer_id = ?
      ORDER BY r.created_at DESC`,
      [farmerId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get Farmer Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your requests.",
    });
  }
};

// ==========================================
// FARMER: View one own request
// GET /api/farmer/requests/:id
// ==========================================
exports.getMyRequestDetails = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const [rows] = await db.query(
      `SELECT
        r.*,
        expert.full_name AS expert_name,
        expert.phone AS expert_phone,
        ep.expertise,
        ep.qualification,
        ep.experience_years,
        ep.bio,
        c.crop_name
      FROM farmer_expert_requests r
      JOIN users expert
        ON r.expert_id = expert.id
      LEFT JOIN expert_profiles ep
        ON expert.id = ep.user_id
      LEFT JOIN farmer_crops fc
        ON r.farmer_crop_id = fc.id
      LEFT JOIN crops c
        ON fc.crop_id = c.id
      WHERE r.id = ?
        AND r.farmer_id = ?
      LIMIT 1`,
      [requestId, farmerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get Farmer Request Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve request details.",
    });
  }
};

// ==========================================
// EXPERT: View incoming requests
// GET /api/experts/requests
// ==========================================
exports.getIncomingRequests = async (req, res) => {
  try {
    const expertId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        r.id,
        r.title,
        r.category,
        r.problem_details,
        r.image_url,
        r.status,
        r.expert_response,
        r.responded_at,
        r.created_at,
        r.updated_at,
        r.farmer_crop_id,
        farmer.full_name AS farmer_name,
        farmer.phone AS farmer_phone,
        fp.district,
        fp.upazila,
        c.crop_name
      FROM farmer_expert_requests r
      JOIN users farmer
        ON r.farmer_id = farmer.id
      LEFT JOIN farmer_profiles fp
        ON farmer.id = fp.user_id
      LEFT JOIN farmer_crops fc
        ON r.farmer_crop_id = fc.id
      LEFT JOIN crops c
        ON fc.crop_id = c.id
      WHERE r.expert_id = ?
      ORDER BY
        CASE r.status
          WHEN 'PENDING' THEN 1
          WHEN 'ACCEPTED' THEN 2
          WHEN 'RESPONDED' THEN 3
          ELSE 4
        END,
        r.created_at DESC`,
      [expertId]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get Incoming Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve incoming requests.",
    });
  }
};

// ==========================================
// EXPERT: Update request status and reply
// PUT /api/experts/requests/:id
// ==========================================
exports.updateRequest = async (req, res) => {
  try {
    const expertId = req.user.id;
    const requestId = Number(req.params.id);

    const { status, expert_response } = req.body || {};

    const allowedStatuses = [
      "ACCEPTED",
      "RESPONDED",
      "RESOLVED",
      "REJECTED",
    ];

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status.",
      });
    }

    if (
      expert_response !== undefined &&
      expert_response !== null &&
      typeof expert_response !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Expert response must be text.",
      });
    }

    const cleanResponse =
      typeof expert_response === "string"
        ? expert_response.trim()
        : "";

    if (status === "RESPONDED" && !cleanResponse) {
      return res.status(400).json({
        success: false,
        message: "Write an Expert response before submitting.",
      });
    }

    const [requests] = await db.query(
      `SELECT id, status, expert_response
       FROM farmer_expert_requests
       WHERE id = ?
         AND expert_id = ?
       LIMIT 1`,
      [requestId, expertId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or not assigned to you.",
      });
    }

    const current = requests[0];

    if (
      current.status === "RESOLVED" ||
      current.status === "REJECTED"
    ) {
      return res.status(400).json({
        success: false,
        message: "This request is already closed.",
      });
    }

    if (status === "ACCEPTED" && current.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be accepted.",
      });
    }

    if (
      status === "REJECTED" &&
      !["PENDING", "ACCEPTED"].includes(current.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "This request can no longer be rejected.",
      });
    }

    if (
      status === "RESPONDED" &&
      !["ACCEPTED", "RESPONDED"].includes(current.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Accept the request before responding.",
      });
    }

    if (
      status === "RESOLVED" &&
      current.status !== "RESPONDED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Respond to the request before resolving it.",
      });
    }

    const responseText =
      cleanResponse || current.expert_response || null;

    await db.query(
      `UPDATE farmer_expert_requests
       SET
         status = ?,
         expert_response = ?,
         responded_at = CASE
           WHEN ? IN ('RESPONDED', 'RESOLVED')
             THEN COALESCE(responded_at, CURRENT_TIMESTAMP)
           ELSE responded_at
         END
       WHERE id = ?
         AND expert_id = ?`,
      [
        status,
        responseText,
        status,
        requestId,
        expertId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Request updated successfully.",
      data: {
        id: requestId,
        status,
        expert_response: responseText,
      },
    });
  } catch (error) {
    console.error("Update Expert Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update request.",
    });
  }
};