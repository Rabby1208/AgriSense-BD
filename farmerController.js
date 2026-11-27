
const db = require("../config/db");

// GET FARMER PROFILE
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.full_name, u.phone,
                    u.role, fp.address, fp.district,
                    fp.upazila
             FROM users u
             LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
             WHERE u.id = ? AND u.role = 'FARMER'`,
            [req.user.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve profile"
        });
    }
};


// UPDATE FARMER PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const {
            full_name,
            phone,
            address,
            district,
            upazila
        } = req.body;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            if (phone) {
                const [existing] = await connection.query(
                    "SELECT id FROM users WHERE phone = ? AND id != ?",
                    [phone.trim(), req.user.id]
                );

                if (existing.length) {
                    await connection.rollback();
                    return res.status(409).json({
                        success: false,
                        message: "Phone number already registered"
                    });
                }
            }

            await connection.query(
                `UPDATE users
                 SET full_name = COALESCE(?, full_name),
                     phone = COALESCE(?, phone)
                 WHERE id = ? AND role = 'FARMER'`,
                [
                    full_name || null,
                    phone ? phone.trim() : null,
                    req.user.id
                ]
            );

            await connection.query(
                `UPDATE farmer_profiles
                 SET address = COALESCE(?, address),
                     district = COALESCE(?, district),
                     upazila = COALESCE(?, upazila)
                 WHERE user_id = ?`,
                [
                    address ?? null,
                    district ?? null,
                    upazila ?? null,
                    req.user.id
                ]
            );

            await connection.commit();

            res.status(200).json({
                success: true,
                message: "Farmer profile updated successfully"
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Profile update failed"
        });
    }
};


// GET ALL CROPS
exports.getCrops = async (req, res) => {
    try {
        const [crops] = await db.query(
            `SELECT id, crop_name, crop_description,
                    farming_information, image_url
             FROM crops
             WHERE is_active = TRUE
             ORDER BY crop_name`
        );

        res.status(200).json({
            success: true,
            total: crops.length,
            data: crops
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve crops"
        });
    }
};


// ADD SELECTED CROP
exports.addCrop = async (req, res) => {
    try {
        const {
            crop_id,
            land_area,
            land_unit,
            planting_date,
            notes
        } = req.body;

        if (!crop_id || !land_area || !land_unit) {
            return res.status(400).json({
                success: false,
                message: "Crop, land area and land unit are required"
            });
        }

        if (!Number.isFinite(Number(land_area)) ||
            Number(land_area) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid land area"
            });
        }

        if (!["DECIMAL", "ACRE"].includes(land_unit)) {
            return res.status(400).json({
                success: false,
                message: "Land unit must be DECIMAL or ACRE"
            });
        }

        const [crop] = await db.query(
            "SELECT id FROM crops WHERE id = ? AND is_active = TRUE",
            [crop_id]
        );

        if (!crop.length) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        const [result] = await db.query(
            `INSERT INTO farmer_crops
             (farmer_id, crop_id, land_area, land_unit,
              planting_date, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                crop_id,
                land_area,
                land_unit,
                planting_date || null,
                notes || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Crop added to farmer profile",
            crop_record_id: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add crop"
        });
    }
};


// GET FARMER SELECTED CROPS
exports.getMyCrops = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT fc.id AS farmer_crop_id,
                    fc.land_area,
                    fc.land_unit,
                    fc.planting_date,
                    fc.farming_status,
                    fc.notes,
                    c.crop_name,
                    c.crop_description,
                    c.farming_information
             FROM farmer_crops fc
             JOIN crops c ON fc.crop_id = c.id
             WHERE fc.farmer_id = ?
             ORDER BY fc.created_at DESC`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            total: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve farmer crops"
        });
    }
};


// UPDATE FARMER CROP
exports.updateCrop = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            land_area,
            land_unit,
            planting_date,
            farming_status,
            notes
        } = req.body;

        if (land_area !== undefined &&
            (!Number.isFinite(Number(land_area)) ||
             Number(land_area) <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Invalid land area"
            });
        }

        if (land_unit && !["DECIMAL", "ACRE"].includes(land_unit)) {
            return res.status(400).json({
                success: false,
                message: "Invalid land unit"
            });
        }

        const allowedStatuses = [
            "PLANNED", "PLANTED", "GROWING", "HARVESTED"
        ];

        if (farming_status &&
            !allowedStatuses.includes(farming_status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid farming status"
            });
        }

        const [result] = await db.query(
            `UPDATE farmer_crops
             SET land_area = COALESCE(?, land_area),
                 land_unit = COALESCE(?, land_unit),
                 planting_date = COALESCE(?, planting_date),
                 farming_status = COALESCE(?, farming_status),
                 notes = COALESCE(?, notes)
             WHERE id = ? AND farmer_id = ?`,
            [
                land_area ?? null,
                land_unit ?? null,
                planting_date ?? null,
                farming_status ?? null,
                notes ?? null,
                id,
                req.user.id
            ]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Farmer crop record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Crop information updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Crop update failed"
        });
    }
};


// DELETE FARMER CROP
exports.deleteCrop = async (req, res) => {
    try {
        const [result] = await db.query(
            `DELETE FROM farmer_crops
             WHERE id = ? AND farmer_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Crop record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Crop removed successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Crop deletion failed"
        });
    }
};


// FARMER DASHBOARD
exports.getDashboard = async (req, res) => {
    try {
        const [profile] = await db.query(
            `SELECT full_name, phone
             FROM users WHERE id = ? AND role = 'FARMER'`,
            [req.user.id]
        );

        if (!profile.length) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        const [crops] = await db.query(
            `SELECT fc.id, fc.land_area, fc.land_unit,
                    fc.farming_status, c.crop_name
             FROM farmer_crops fc
             JOIN crops c ON fc.crop_id = c.id
             WHERE fc.farmer_id = ?`,
            [req.user.id]
        );

        const [financials] = await db.query(
            `SELECT
                COALESCE((
                    SELECT SUM(fc.amount)
                    FROM farming_costs fc
                    JOIN farmer_crops f
                    ON fc.farmer_crop_id = f.id
                    WHERE f.farmer_id = ?
                ), 0) AS total_cost,
                COALESCE((
                    SELECT SUM(fr.amount)
                    FROM farming_revenues fr
                    JOIN farmer_crops f
                    ON fr.farmer_crop_id = f.id
                    WHERE f.farmer_id = ?
                ), 0) AS total_revenue`,
            [req.user.id, req.user.id]
        );

        const totalCost = Number(financials[0].total_cost);
        const totalRevenue = Number(financials[0].total_revenue);

        res.status(200).json({
            success: true,
            data: {
                profile: profile[0],
                total_crops: crops.length,
                crops,
                total_cost: totalCost,
                total_revenue: totalRevenue,
                profit_loss: totalRevenue - totalCost
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Dashboard data retrieval failed"
        });
    }
};
