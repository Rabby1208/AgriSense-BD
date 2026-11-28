
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

// ==========================================
// ROUTE IMPORTS
// ==========================================

const authRoutes = require("./routes/authRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const financeRoutes = require("./routes/financeRoutes");
const cropSalesRoutes = require("./routes/cropSalesRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");

const adminRoutes = require("./routes/adminRoutes");
const adminExpertRoutes = require("./routes/adminExpertRoutes");
const expertRoutes = require("./routes/expertRoutes");

const farmingExpenseRoutes = require("./routes/farmingExpenseRoutes");
const orderRoutes = require("./routes/orderRoutes");

const farmerDiseaseHistoryRoutes = require("./routes/farmerDiseaseHistoryRoutes");
const diseaseDetectionRoutes = require("./routes/diseaseDetectionRoutes");

// ==========================================
// APP INITIALIZATION
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// AUTHENTICATION
// ==========================================

app.use("/api/auth", authRoutes);

// ==========================================
// FARMER
// ==========================================

app.use("/api/farmer", farmerRoutes);
app.use("/api/finance", financeRoutes);

// ==========================================
// DISEASE DETECTION
// ==========================================

app.use("/api/disease-detection", diseaseDetectionRoutes);

// ==========================================
// DISEASE HISTORY
// ==========================================

app.use(
  "/api/farmer/disease-history",
  farmerDiseaseHistoryRoutes
);

app.use(
  "/api/disease-history",
  farmerDiseaseHistoryRoutes
);

// ==========================================
// ADMIN
// ==========================================

app.use("/api/admin", adminRoutes);
app.use("/api/admin/experts", adminExpertRoutes);

// ==========================================
// EXPERT
// ==========================================

app.use("/api/experts", expertRoutes);

// ==========================================
// FARMING EXPENSES
// ==========================================

app.use("/api/farming-expenses", farmingExpenseRoutes);

// ==========================================
// CROP SALES
// ==========================================

app.use("/api/crop-sales", cropSalesRoutes);

// ==========================================
// MARKETPLACE
// ==========================================

app.use("/api/marketplace", marketplaceRoutes);

// ==========================================
// ORDERS
// ==========================================

app.use("/api/orders", orderRoutes);

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to AgriSense BD API",
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriSense BD API is running",
  });
});

// ==========================================
// DATABASE CHECK
// ==========================================

app.get("/api/db-check", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS database_name"
    );

    res.status(200).json({
      success: true,
      message: "MySQL connection successful",
      database: rows[0].database_name,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    endpoint: req.originalUrl,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AgriSense BD Server running on port ${PORT}`);
});
