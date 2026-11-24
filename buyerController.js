const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerBuyer = async (req, res) => {
    try {
        const { full_name, phone, password } = req.body;

        if (!full_name || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and password are required"
            });
        }

        if (!/^(\+?8801|01)[3-9]\d{8}$/.test(phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid Bangladesh phone number"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM users WHERE phone = ?",
            [phone.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
             (full_name, phone, password_hash, role, is_active)
             VALUES (?, ?, ?, 'BUYER', 1)`,
            [full_name.trim(), phone.trim(), passwordHash]
        );

        return res.status(201).json({
            success: true,
            message: "Buyer registration successful",
            buyer: {
                id: result.insertId,
                full_name: full_name.trim(),
                phone: phone.trim(),
                role: "BUYER"
            }
        });

    } catch (error) {
        console.error("Buyer Registration Error:", error);

        return res.status(500).json({
            success: false,
            message: "Buyer registration failed"
        });
    }
};


exports.loginBuyer = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Phone and password are required"
            });
        }

        const [users] = await db.query(
            `SELECT id, full_name, phone, password_hash, role, is_active
             FROM users
             WHERE phone = ? AND role = 'BUYER'
             LIMIT 1`,
            [phone.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password"
            });
        }

        const buyer = users[0];

        if (!buyer.is_active) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            buyer.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        const token = jwt.sign(
            {
                id: buyer.id,
                role: buyer.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Buyer login successful",
            token,
            buyer: {
                id: buyer.id,
                full_name: buyer.full_name,
                phone: buyer.phone,
                role: buyer.role
            }
        });

    } catch (error) {
        console.error("Buyer Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Buyer login failed"
        });
    }
};


exports.getBuyerProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, full_name, phone, role, created_at
             FROM users
             WHERE id = ? AND role = 'BUYER'`,
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Buyer not found"
            });
        }

        return res.status(200).json({
            success: true,
            buyer: rows[0]
        });

    } catch (error) {
        console.error("Buyer Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load buyer profile"
        });
    }
};