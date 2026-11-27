
const db = require("../config/db");

// Check whether the selected crop belongs to the logged-in farmer.
// farmer_crops.farmer_id stores users.id, not farmer_profiles.id.
async function verifyCropOwnership(connection, cropId, userId) {
  const [rows] = await connection.execute(
    `SELECT id
     FROM farmer_crops
     WHERE id = ? AND farmer_id = ?`,
    [cropId, userId]
  );

  return rows.length > 0;
}

// Validate expense input
function validateExpense(data) {
  const {
    farmer_crop_id,
    expense_name,
    amount,
    expense_date,
  } = data;

  if (
    !farmer_crop_id ||
    !expense_name ||
    !String(expense_name).trim() ||
    amount === undefined ||
    amount === null ||
    amount === "" ||
    !expense_date
  ) {
    return "Crop, expense name, amount and date are required.";
  }

  if (
    !Number.isInteger(Number(farmer_crop_id)) ||
    Number(farmer_crop_id) <= 0
  ) {
    return "Please select a valid crop.";
  }

  if (
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return "Enter a valid expense amount.";
  }

  if (
    typeof expense_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(expense_date)
  ) {
    return "Expense date must be in YYYY-MM-DD format.";
  }

  return null;
}

// GET: Get all expenses of logged-in farmer
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT
         f.id,
         f.farmer_crop_id,
         f.expense_name,
         f.vendor_name,
         f.amount,
         f.expense_date,
         f.description,
         c.crop_name
       FROM farming_costs f
       INNER JOIN farmer_crops fc
         ON fc.id = f.farmer_crop_id
       INNER JOIN crops c
         ON c.id = fc.crop_id
       WHERE fc.farmer_id = ?
       ORDER BY f.expense_date DESC, f.id DESC`,
      [userId]
    );

    const total = rows.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    return res.status(200).json({
      success: true,
      total,
      expenses: rows,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load farming expenses.",
    });
  }
};

// POST: Add a new expense
exports.addExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      farmer_crop_id,
      expense_name,
      vendor_name,
      amount,
      expense_date,
      description,
    } = req.body;

    const validationError = validateExpense(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const owned = await verifyCropOwnership(
      db,
      Number(farmer_crop_id),
      userId
    );

    if (!owned) {
      return res.status(404).json({
        success: false,
        message: "Selected crop was not found.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO farming_costs
       (
         farmer_crop_id,
         expense_name,
         vendor_name,
         amount,
         expense_date,
         description
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(farmer_crop_id),
        expense_name.trim(),
        vendor_name ? vendor_name.trim() : null,
        Number(amount),
        expense_date,
        description || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Farming expense added successfully.",
      expenseId: result.insertId,
    });
  } catch (error) {
    console.error("Add expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add farming expense.",
    });
  }
};

// PUT: Update an existing expense
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const {
      farmer_crop_id,
      expense_name,
      vendor_name,
      amount,
      expense_date,
      description,
    } = req.body;

    const validationError = validateExpense(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const owned = await verifyCropOwnership(
      db,
      Number(farmer_crop_id),
      userId
    );

    if (!owned) {
      return res.status(404).json({
        success: false,
        message: "Selected crop was not found.",
      });
    }

    // Check whether this expense belongs to the logged-in farmer
    const [existingExpense] = await db.execute(
      `SELECT f.id
       FROM farming_costs f
       INNER JOIN farmer_crops fc
         ON fc.id = f.farmer_crop_id
       WHERE f.id = ? AND fc.farmer_id = ?`,
      [expenseId, userId]
    );

    if (existingExpense.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    await db.execute(
      `UPDATE farming_costs
       SET
         farmer_crop_id = ?,
         expense_name = ?,
         vendor_name = ?,
         amount = ?,
         expense_date = ?,
         description = ?
       WHERE id = ?`,
      [
        Number(farmer_crop_id),
        expense_name.trim(),
        vendor_name ? vendor_name.trim() : null,
        Number(amount),
        expense_date,
        description || null,
        expenseId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
    });
  } catch (error) {
    console.error("Update expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update expense.",
    });
  }
};

// DELETE: Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const [result] = await db.execute(
      `DELETE f
       FROM farming_costs f
       INNER JOIN farmer_crops fc
         ON fc.id = f.farmer_crop_id
       WHERE f.id = ? AND fc.farmer_id = ?`,
      [expenseId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete farming expense.",
    });
  }
};
