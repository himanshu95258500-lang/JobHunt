const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        message: "Auth route is working!"
    });
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // Only allow public registration for these two roles
        if (!["jobseeker", "recruiter"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        // Check if email already exists
        const [existingUser] = await db
            .promise()
            .query("SELECT id FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db
            .promise()
            .query(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                [name, email, hashedPassword, role]
            );

        res.status(201).json({
            message: "Account created successfully",
            userId: result.insertId,
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        // Find user
        const [users] = await db
            .promise()
            .query(
                "SELECT id, name, email, password, role FROM users WHERE email = ?",
                [email]
            );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const user = users[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Login successful
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
});
// Get logged-in user's profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get basic user information
        const [users] = await db.promise().query(
            "SELECT id, name, email, role FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Get job seeker profile
        const [profiles] = await db.promise().query(
            `SELECT
        phone,
        location,
        professional_title,
        about,
        skills,
        education,
        experience,
        resume
       FROM job_seeker_profiles
       WHERE user_id = ?`,
            [userId]
        );

        res.status(200).json({
            message: "Profile fetched successfully",

            user: users[0],

            profile: profiles.length > 0 ? profiles[0] : null,
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Failed to fetch profile",
        });
    }
});

// Save Job Seeker Profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const {
            fullName,
            phone,
            location,
            professional_title,
            about,
            skills,
            education,
            experience,
            resume,
        } = req.body;

        const userId = req.user.id;

        if (fullName && fullName.trim()) {
            await db.promise().query(
                `UPDATE users
                SET name = ?
                WHERE id = ?`,
                [fullName.trim(), userId]
            );
        }

        const [existingProfile] = await db.promise().query(
            "SELECT id FROM job_seeker_profiles WHERE user_id = ?",
            [userId]
        );

        if (existingProfile.length > 0) {
            await db.promise().query(
                `UPDATE job_seeker_profiles
         SET phone = ?,
             location = ?,
             professional_title = ?,
             about = ?,
             skills = ?,
             education = ?,
             experience = ?,
             resume = ?
         WHERE user_id = ?`,
                [
                    phone,
                    location,
                    professional_title,
                    about,
                    skills,
                    education,
                    experience,
                    resume,
                    userId,
                ]
            );
        } else {
            await db.promise().query(
                `INSERT INTO job_seeker_profiles
         (user_id, phone, location, professional_title, about, skills, education, experience, resume)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    phone,
                    location,
                    professional_title,
                    about,
                    skills,
                    education,
                    experience,
                    resume,
                ]
            );
        }

        res.status(200).json({
            message: "Profile saved successfully",
        });
    } catch (error) {
        console.error("Save profile error:", error);

        res.status(500).json({
            message: "Failed to save profile",
        });
    }
});

module.exports = router;
