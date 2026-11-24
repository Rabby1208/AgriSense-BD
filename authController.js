
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =================================
// FARMER REGISTRATION
// =================================

exports.register = async (req, res) => {
    const {
        full_name,
        phone,
        password,
        address,
        district,
        upazila
    } = req.body;

    let connection;

    try {
        if (!full_name || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, phone number and password are required"
            });
        }

        const cleanName = String(full_name).trim();
        const cleanPhone = String(phone).trim();

        if (!cleanName) {
            return res.status(400).json({
                success: false,
                message: "Full name is required"
            });
        }

        if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number"
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM users WHERE phone = ?",
            [cleanPhone]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        connection = await db.getConnection();

        await connection.beginTransaction();

        const [userResult] = await connection.query(
            `INSERT INTO users
            (full_name, phone, password_hash, role)
            VALUES (?, ?, ?, 'FARMER')`,
            [cleanName, cleanPhone, hashedPassword]
        );

        await connection.query(
            `INSERT INTO farmer_profiles
            (user_id, address, district, upazila)
            VALUES (?, ?, ?, ?)`,
            [
                userResult.insertId,
                address || null,
                district || null,
                upazila || null
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Farmer registered successfully"
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        console.error("Farmer Registration Error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// =================================
// USER LOGIN WITH PHONE NUMBER
// =================================

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Phone number and password are required"
            });
        }

        const cleanPhone = String(phone).trim();

        const [users] = await db.query(
            `SELECT
                id,
                full_name,
                phone,
                password_hash,
                role,
                is_active
            FROM users
            WHERE phone = ?`,
            [cleanPhone]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password"
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error"
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: Number(user.id),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};


// =================================
// GET LOGGED-IN USER
// =================================

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT
                id,
                full_name,
                phone,
                role
            FROM users
            WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not retrieve profile"
        });
    }
};
