
const db = require("../config/db");

// Validate YYYY-MM-DD
function isValidDate(date) {
  if (!date) return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
}

// Check whether this crop belongs to the logged-in farmer
async function checkFarmerCrop(farmerCropId, farmerId) {
  const [rows] = await db.query(
    `SELECT id FROM farmer_crops
     WHERE id = ? AND farmer_id = ?`,
    [farmerCropId, farmerId]
  );

  return rows.length > 0;
}

// ================= COST MANAGEMENT =================

// Add farming cost
exports.addCost = async (req, res) => {
  try {
    const { farmer_crop_id, expense_name, amount, expense_date, description } = req.body;

    if (!farmer_crop_id || !expense_name || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Crop, expense name and amount are required"
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }

    if (expense_date && !isValidDate(expense_date)) {
      return res.status(400).json({
        success: false,
        message: "Expense date must be YYYY-MM-DD"
      });
    }

    const ownsCrop = await checkFarmerCrop(
      farmer_crop_id,
      req.user.id
    );

    if (!ownsCrop) {
      return res.status(404).json({
        success: false,
        message: "Farmer crop not found"
      });
    }

    const [result] = await db.query(
      `INSERT INTO farming_costs
       (farmer_crop_id, expense_name, amount, expense_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        farmer_crop_id,
        expense_name.trim(),
        Number(amount),
        expense_date || new Date().toISOString().slice(0, 10),
        description || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Farming cost added successfully",
      cost_id: result.insertId
    });

  } catch (error) {
    console.error("Add Cost Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add farming cost"
    });
  }
};

// Get all costs of logged-in farmer
exports.getCosts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         fc.id AS farmer_crop_id,
         c.crop_name,
         costs.id,
         costs.expense_name,
         costs.amount,
         costs.expense_date,
         costs.description
       FROM farming_costs costs
       JOIN farmer_crops fc ON costs.farmer_crop_id = fc.id
       JOIN crops c ON fc.crop_id = c.id
       WHERE fc.farmer_id = ?
       ORDER BY costs.expense_date DESC, costs.id DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Get Costs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve farming costs"
    });
  }
};

// Update a cost
exports.updateCost = async (req, res) => {
  try {
    const { expense_name, amount, expense_date, description } = req.body;
    const { id } = req.params;

    if (!expense_name || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Expense name and amount are required"
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }

    if (expense_date && !isValidDate(expense_date)) {
      return res.status(400).json({
        success: false,
        message: "Expense date must be YYYY-MM-DD"
      });
    }

    const [result] = await db.query(
      `UPDATE farming_costs costs
       JOIN farmer_crops fc ON costs.farmer_crop_id = fc.id
       SET costs.expense_name = ?,
           costs.amount = ?,
           costs.expense_date = ?,
           costs.description = ?
       WHERE costs.id = ? AND fc.farmer_id = ?`,
      [
        expense_name.trim(),
        Number(amount),
        expense_date || new Date().toISOString().slice(0, 10),
        description || null,
        id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Farming cost not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farming cost updated successfully"
    });

  } catch (error) {
    console.error("Update Cost Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update farming cost"
    });
  }
};

// Delete a cost
exports.deleteCost = async (req, res) => {
  try {
    const [result] = await db.query(
      `DELETE costs FROM farming_costs costs
       JOIN farmer_crops fc ON costs.farmer_crop_id = fc.id
       WHERE costs.id = ? AND fc.farmer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Farming cost not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farming cost deleted successfully"
    });

  } catch (error) {
    console.error("Delete Cost Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete farming cost"
    });
  }
};

// ================= REVENUE MANAGEMENT =================

// Add farming revenue
exports.addRevenue = async (req, res) => {
  try {
    const { farmer_crop_id, revenue_source, amount, revenue_date, description } = req.body;

    if (!farmer_crop_id || !revenue_source || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Crop, revenue source and amount are required"
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }

    if (revenue_date && !isValidDate(revenue_date)) {
      return res.status(400).json({
        success: false,
        message: "Revenue date must be YYYY-MM-DD"
      });
    }

    const ownsCrop = await checkFarmerCrop(
      farmer_crop_id,
      req.user.id
    );

    if (!ownsCrop) {
      return res.status(404).json({
        success: false,
        message: "Farmer crop not found"
      });
    }

    const [result] = await db.query(
      `INSERT INTO farming_revenues
       (farmer_crop_id, revenue_source, amount, revenue_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        farmer_crop_id,
        revenue_source.trim(),
        Number(amount),
        revenue_date || new Date().toISOString().slice(0, 10),
        description || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Farming revenue added successfully",
      revenue_id: result.insertId
    });

  } catch (error) {
    console.error("Add Revenue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add farming revenue"
    });
  }
};

// Get all revenues of logged-in farmer
exports.getRevenues = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         fc.id AS farmer_crop_id,
         c.crop_name,
         revenue.id,
         revenue.revenue_source,
         revenue.amount,
         revenue.revenue_date,
         revenue.description
       FROM farming_revenues revenue
       JOIN farmer_crops fc ON revenue.farmer_crop_id = fc.id
       JOIN crops c ON fc.crop_id = c.id
       WHERE fc.farmer_id = ?
       ORDER BY revenue.revenue_date DESC, revenue.id DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Get Revenues Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve farming revenues"
    });
  }
};

// Update revenue
exports.updateRevenue = async (req, res) => {
  try {
    const { revenue_source, amount, revenue_date, description } = req.body;

    if (!revenue_source || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Revenue source and amount are required"
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }

    if (revenue_date && !isValidDate(revenue_date)) {
      return res.status(400).json({
        success: false,
        message: "Revenue date must be YYYY-MM-DD"
      });
    }

    const [result] = await db.query(
      `UPDATE farming_revenues revenue
       JOIN farmer_crops fc ON revenue.farmer_crop_id = fc.id
       SET revenue.revenue_source = ?,
           revenue.amount = ?,
           revenue.revenue_date = ?,
           revenue.description = ?
       WHERE revenue.id = ? AND fc.farmer_id = ?`,
      [
        revenue_source.trim(),
        Number(amount),
        revenue_date || new Date().toISOString().slice(0, 10),
        description || null,
        req.params.id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Farming revenue not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farming revenue updated successfully"
    });

  } catch (error) {
    console.error("Update Revenue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update farming revenue"
    });
  }
};

// Delete revenue
exports.deleteRevenue = async (req, res) => {
  try {
    const [result] = await db.query(
      `DELETE revenue FROM farming_revenues revenue
       JOIN farmer_crops fc ON revenue.farmer_crop_id = fc.id
       WHERE revenue.id = ? AND fc.farmer_id = ?`,
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Farming revenue not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farming revenue deleted successfully"
    });

  } catch (error) {
    console.error("Delete Revenue Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete farming revenue"
    });
  }
};
