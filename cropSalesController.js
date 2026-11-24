
const db = require("../config/db");

// ==========================================
// VERIFY FARMER CROP OWNERSHIP
// ==========================================

async function verifyCropOwnership(cropId, userId) {
    const [rows] = await db.execute(
        `SELECT fc.id
         FROM farmer_crops fc
         INNER JOIN farmer_profiles fp
            ON fp.id = fc.farmer_id
         WHERE fc.id = ? AND fp.user_id = ?`,
        [cropId, userId]
    );

    return rows.length > 0;
}

// ==========================================
// GET SALES HISTORY
// ==========================================

exports.getSales = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            `SELECT
                s.id,
                s.farmer_crop_id,
                s.quantity,
                s.unit,
                s.unit_price,
                s.total_amount,
                s.sale_date,
                s.buyer_name,
                s.sale_type,
                s.notes,
                c.crop_name
             FROM crop_sales s
             INNER JOIN farmer_crops fc
                ON fc.id = s.farmer_crop_id
             INNER JOIN crops c
                ON c.id = fc.crop_id
             INNER JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id
             WHERE fp.user_id = ?
             ORDER BY s.sale_date DESC, s.id DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            totalSales: rows.reduce(
                (sum, item) => sum + Number(item.total_amount),
                0
            ),
            sales: rows
        });

    } catch (error) {
        console.error("Get sales error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load sales."
        });
    }
};

// ==========================================
// ADD DIRECT SALE
// ==========================================

exports.addSale = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            farmer_crop_id,
            quantity,
            unit,
            unit_price,
            sale_date,
            buyer_name,
            notes
        } = req.body;

        if (
            !farmer_crop_id ||
            !quantity ||
            !unit_price ||
            !sale_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Crop, quantity, price and sale date are required."
            });
        }

        if (
            !Number.isFinite(Number(quantity)) ||
            Number(quantity) <= 0 ||
            !Number.isFinite(Number(unit_price)) ||
            Number(unit_price) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity or unit price."
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(sale_date)) {
            return res.status(400).json({
                success: false,
                message: "Sale date must be YYYY-MM-DD."
            });
        }

        const owned = await verifyCropOwnership(
            farmer_crop_id,
            userId
        );

        if (!owned) {
            return res.status(404).json({
                success: false,
                message: "Crop not found."
            });
        }

        const totalAmount =
            Number(quantity) * Number(unit_price);

        const [result] = await db.execute(
            `INSERT INTO crop_sales
            (
                farmer_crop_id,
                quantity,
                unit,
                unit_price,
                total_amount,
                sale_date,
                buyer_name,
                sale_type,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'DIRECT', ?)`,
            [
                farmer_crop_id,
                Number(quantity),
                unit || "KG",
                Number(unit_price),
                totalAmount,
                sale_date,
                buyer_name || null,
                notes || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Sale recorded successfully.",
            saleId: result.insertId,
            totalAmount
        });

    } catch (error) {
        console.error("Add sale error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to record sale."
        });
    }
};

// ==========================================
// PROFIT AND LOSS REPORT
// ==========================================

exports.getProfitLoss = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            `SELECT
                fc.id AS farmer_crop_id,
                c.crop_name,
                COALESCE(costs.total_cost, 0) AS total_cost,
                COALESCE(sales.total_sales, 0) AS total_sales,
                COALESCE(sales.total_quantity_sold, 0)
                    AS total_quantity_sold
             FROM farmer_crops fc
             INNER JOIN crops c
                ON c.id = fc.crop_id
             INNER JOIN farmer_profiles fp
                ON fp.id = fc.farmer_id
             LEFT JOIN (
                SELECT
                    farmer_crop_id,
                    SUM(amount) AS total_cost
                FROM farming_costs
                GROUP BY farmer_crop_id
             ) costs
                ON costs.farmer_crop_id = fc.id
             LEFT JOIN (
                SELECT
                    farmer_crop_id,
                    SUM(total_amount) AS total_sales,
                    SUM(quantity) AS total_quantity_sold
                FROM crop_sales
                GROUP BY farmer_crop_id
             ) sales
                ON sales.farmer_crop_id = fc.id
             WHERE fp.user_id = ?
             ORDER BY fc.id DESC`,
            [userId]
        );

        const report = rows.map(item => {
            const totalCost = Number(item.total_cost);
            const totalSales = Number(item.total_sales);

            const profitLoss = totalSales - totalCost;

            return {
                farmer_crop_id: item.farmer_crop_id,
                crop_name: item.crop_name,
                total_cost: totalCost,
                total_sales: totalSales,
                total_quantity_sold: Number(
                    item.total_quantity_sold
                ),
                profit_loss: profitLoss,
                status:
                    profitLoss > 0
                        ? "PROFIT"
                        : profitLoss < 0
                            ? "LOSS"
                            : "BREAK_EVEN"
            };
        });

        const totalCost = report.reduce(
            (sum, item) => sum + item.total_cost,
            0
        );

        const totalSales = report.reduce(
            (sum, item) => sum + item.total_sales,
            0
        );

        const netProfitLoss = totalSales - totalCost;

        return res.status(200).json({
            success: true,
            summary: {
                totalCost,
                totalSales,
                netProfitLoss,
                status:
                    netProfitLoss > 0
                        ? "PROFIT"
                        : netProfitLoss < 0
                            ? "LOSS"
                            : "BREAK_EVEN"
            },
            crops: report
        });

    } catch (error) {
        console.error("Profit loss error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to generate profit/loss report."
        });
    }
};
