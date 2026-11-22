
const express = require("express");
const router = express.Router();

const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/farmingExpenseController");

// Import the existing authentication middleware
const { verifyToken } = require("../middleware/authMiddleware");

// Check middleware
if (typeof verifyToken !== "function") {
  throw new Error(
    "verifyToken middleware is not exported correctly."
  );
}

// Protect all expense routes
router.use(verifyToken);

// GET all expenses
router.get("/", getExpenses);

// ADD expense
router.post("/", addExpense);

// UPDATE expense
router.put("/:id", updateExpense);

// DELETE expense
router.delete("/:id", deleteExpense);

module.exports = router;
