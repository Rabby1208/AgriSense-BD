
const db = require("../config/db");

// PUBLIC EXPERT LIST
exports.getPublicExperts = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.full_name, u.phone,
                    ep.expertise, ep.qualification,
                    ep.experience_years, ep.bio,
                    ep.contact_information
             FROM users u
             JOIN expert_profiles ep ON u.id = ep.user_id
             WHERE u.role = 'AGRI_EXPERT'
             AND u.is_active = 1
             ORDER BY u.full_name ASC`
        );

        return res.status(200).json({
            success: true,
            total: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("Public Experts Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve expert information"
        });
    }
};


// EXPERT OWN PROFILE
exports.getMyProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.full_name, u.phone,
                    ep.expertise, ep.qualification,
                    ep.experience_years, ep.bio,
                    ep.contact_information
             FROM users u
             JOIN expert_profiles ep ON u.id = ep.user_id
             WHERE u.id = ? AND u.role = 'AGRI_EXPERT'`,
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Expert profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error("Expert Profile Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve expert profile"
        });
    }
};


// GET ALL FARMERS WITH THEIR CROPS
exports.getFarmers = async (req, res) => {
    try {
        const [farmers] = await db.query(
            `SELECT
                u.id,
                u.full_name,
                u.phone,
                fp.address,
                fp.district,
                fp.upazila
             FROM users u
             LEFT JOIN farmer_profiles fp
                ON u.id = fp.user_id
             WHERE u.role = 'FARMER'
             AND u.is_active = 1
             ORDER BY u.full_name ASC`
        );

        if (!farmers.length) {
            return res.status(200).json({
                success: true,
                total: 0,
                data: []
            });
        }

        const farmerIds = farmers.map(farmer => farmer.id);

        const [crops] = await db.query(
            `SELECT
                fc.id AS farmer_crop_id,
                fc.farmer_id,
                fc.land_area,
                fc.land_unit,
                fc.planting_date,
                fc.farming_status,
                fc.notes,
                c.id AS crop_id,
                c.crop_name,
                c.crop_description,
                c.farming_information
             FROM farmer_crops fc
             JOIN crops c ON fc.crop_id = c.id
             WHERE fc.farmer_id IN (?)
             ORDER BY fc.created_at DESC`,
            [farmerIds]
        );

        const cropMap = {};

        farmers.forEach(farmer => {
            cropMap[farmer.id] = [];
        });

        crops.forEach(crop => {
            cropMap[crop.farmer_id].push(crop);
        });

        const data = farmers.map(farmer => ({
            ...farmer,
            crops: cropMap[farmer.id] || [],
            total_crops: (cropMap[farmer.id] || []).length
        }));

        return res.status(200).json({
            success: true,
            total: data.length,
            data
        });

    } catch (error) {
        console.error("Get Farmers Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve farmer information"
        });
    }
};


// GET SINGLE FARMER DETAILS
exports.getFarmerDetails = async (req, res) => {
    try {
        const farmerId = Number(req.params.id);

        if (!Number.isInteger(farmerId) || farmerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid farmer ID"
            });
        }

        const [farmers] = await db.query(
            `SELECT
                u.id,
                u.full_name,
                u.phone,
                u.role,
                fp.address,
                fp.district,
                fp.upazila
             FROM users u
             LEFT JOIN farmer_profiles fp
                ON u.id = fp.user_id
             WHERE u.id = ?
             AND u.role = 'FARMER'
             AND u.is_active = 1`,
            [farmerId]
        );

        if (!farmers.length) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        const [crops] = await db.query(
            `SELECT
                fc.id AS farmer_crop_id,
                fc.land_area,
                fc.land_unit,
                fc.planting_date,
                fc.farming_status,
                fc.notes,
                c.id AS crop_id,
                c.crop_name,
                c.crop_description,
                c.farming_information
             FROM farmer_crops fc
             JOIN crops c ON fc.crop_id = c.id
             WHERE fc.farmer_id = ?
             ORDER BY fc.created_at DESC`,
            [farmerId]
        );

        return res.status(200).json({
            success: true,
            data: {
                ...farmers[0],
                total_crops: crops.length,
                crops
            }
        });

    } catch (error) {
        console.error("Farmer Details Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve farmer details"
        });
    }
};


// GET DISEASE DETECTION HISTORY FOR EXPERT
exports.getDiseaseDetectionHistory = async (req, res) => {
    try {
        const farmerId = req.query.farmerId
            ? Number(req.query.farmerId)
            : null;

        if (
            farmerId !== null &&
            (!Number.isInteger(farmerId) || farmerId <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid farmer ID"
            });
        }

        const limitValue = Number(req.query.limit || 50);
        const limit = Number.isInteger(limitValue)
            ? Math.min(Math.max(limitValue, 1), 100)
            : 50;

        const offsetValue = Number(req.query.offset || 0);
        const offset = Number.isInteger(offsetValue)
            ? Math.max(offsetValue, 0)
            : 0;

        let sql = `
            SELECT
                h.id,
                h.farmer_id,
                u.full_name AS farmer_name,
                u.phone AS farmer_phone,
                fp.district,
                fp.upazila,
                h.crop_name,
                h.disease_name,
                h.confidence,
                h.detection_status,
                h.disease_detected,
                h.prediction_result,
                h.created_at
            FROM disease_detection_history h
            JOIN users u ON h.farmer_id = u.id
            LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
            WHERE u.role = 'FARMER'
            AND u.is_active = 1
        `;

        const params = [];

        if (farmerId !== null) {
            sql += " AND h.farmer_id = ?";
            params.push(farmerId);
        }

        sql += `
            ORDER BY h.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);

        const [rows] = await db.query(sql, params);

        let countSql = `
            SELECT COUNT(*) AS total
            FROM disease_detection_history h
            JOIN users u ON h.farmer_id = u.id
            WHERE u.role = 'FARMER'
            AND u.is_active = 1
        `;

        const countParams = [];

        if (farmerId !== null) {
            countSql += " AND h.farmer_id = ?";
            countParams.push(farmerId);
        }

        const [countRows] = await db.query(
            countSql,
            countParams
        );

        return res.status(200).json({
            success: true,
            total: countRows[0].total,
            limit,
            offset,
            data: rows
        });

    } catch (error) {
        console.error(
            "Disease Detection History Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve disease detection history"
        });
    }
};

module.exports = exports;
