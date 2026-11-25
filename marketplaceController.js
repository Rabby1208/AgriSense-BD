
const db = require("../config/db");

// ==========================================
// GET PUBLIC MARKETPLACE LISTINGS
// ==========================================

exports.getListings = async (req, res) => {
    try {
        const {
            search,
            district
        } = req.query;

        let sql = `
            SELECT
                ml.id,
                ml.farmer_crop_id,
                ml.quantity,
                ml.available_quantity,
                ml.unit,
                ml.price_per_unit,
                ml.location,
                ml.description,
                ml.status,
                ml.created_at,
                c.crop_name,
                fp.district,
                fp.upazila
            FROM marketplace_listings ml
            INNER JOIN farmer_crops fc
                ON fc.id = ml.farmer_crop_id
            INNER JOIN crops c
                ON c.id = fc.crop_id
            INNER JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id
            WHERE ml.status = 'ACTIVE'
              AND ml.available_quantity > 0
              AND fc.farming_status = 'HARVESTED'
        `;

        const params = [];

        if (search) {
            sql += " AND c.crop_name LIKE ?";
            params.push(`%${search}%`);
        }

        if (district) {
            sql += " AND fp.district = ?";
            params.push(district);
        }

        sql += " ORDER BY ml.created_at DESC";

        const [rows] = await db.execute(sql, params);

        return res.status(200).json({
            success: true,
            total: rows.length,
            listings: rows
        });

    } catch (error) {
        console.error("Marketplace listings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load marketplace."
        });
    }
};

// ==========================================
// CREATE MARKETPLACE LISTING
// ==========================================

exports.createListing = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            farmer_crop_id,
            quantity,
            unit,
            price_per_unit,
            location,
            description
        } = req.body;

        if (
            !farmer_crop_id ||
            !quantity ||
            !price_per_unit
        ) {
            return res.status(400).json({
                success: false,
                message: "Crop, quantity and price are required."
            });
        }

        if (
            !Number.isFinite(Number(quantity)) ||
            Number(quantity) <= 0 ||
            !Number.isFinite(Number(price_per_unit)) ||
            Number(price_per_unit) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity or price."
            });
        }

        const [crops] = await db.execute(
            `SELECT fc.id
             FROM farmer_crops fc
             INNER JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id
             WHERE fc.id = ?
               AND fp.user_id = ?
               AND fc.farming_status = 'HARVESTED'`,
            [farmer_crop_id, userId]
        );

        if (crops.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Harvested crop not found or not owned by you."
            });
        }

        const [result] = await db.execute(
            `INSERT INTO marketplace_listings
            (
                farmer_crop_id,
                quantity,
                available_quantity,
                unit,
                price_per_unit,
                location,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                farmer_crop_id,
                Number(quantity),
                Number(quantity),
                unit || "KG",
                Number(price_per_unit),
                location || null,
                description || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Marketplace listing created successfully.",
            listingId: result.insertId
        });

    } catch (error) {
        console.error("Create listing error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create listing."
        });
    }
};

// ==========================================
// GET MY LISTINGS
// ==========================================

exports.getMyListings = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            `SELECT
                ml.*,
                c.crop_name
             FROM marketplace_listings ml
             INNER JOIN farmer_crops fc
                ON fc.id = ml.farmer_crop_id
             INNER JOIN crops c
                ON c.id = fc.crop_id
             INNER JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id
             WHERE fp.user_id = ?
             ORDER BY ml.created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            listings: rows
        });

    } catch (error) {
        console.error("My listings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load your listings."
        });
    }
};

// ==========================================
// DELETE / DEACTIVATE MY LISTING
// ==========================================

exports.deleteListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const listingId = req.params.id;

        const [result] = await db.execute(
            `UPDATE marketplace_listings ml
             INNER JOIN farmer_crops fc
                ON fc.id = ml.farmer_crop_id
             INNER JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id
             SET ml.status = 'INACTIVE'
             WHERE ml.id = ?
               AND fp.user_id = ?
               AND ml.status != 'INACTIVE'`,
            [listingId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Listing not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Listing deactivated successfully."
        });

    } catch (error) {
        console.error("Delete listing error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to deactivate listing."
        });
    }
};
