
const express = require("express");
const router = express.Router();

// Authentication Controllers
const {
    register,
    login,
    getMe
} = require("../controllers/authController");

// Authentication Middleware
const {
    verifyToken
} = require("../middleware/authMiddleware");

// =================================
// PUBLIC AUTHENTICATION ROUTES
// =================================

// Farmer Registration
router.post("/register", register);

// Login with Phone Number and Password
router.post("/login", login);


// =================================
// PROTECTED AUTHENTICATION ROUTES
// =================================

// Get Logged-in User Profile
router.get("/me", verifyToken, getMe);


module.exports = router;
