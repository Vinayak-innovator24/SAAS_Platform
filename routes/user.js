require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // importing the User Schema
const router = express.Router();
const verifyAccessToken = require("./middleware"); // importing the verifyAccessToken middleware

// POST /v1/auth/signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Hashing the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        // Create a new user record in the database
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        console.log(newUser);

        await newUser.save();

        // Create and sign a JWT token
        const accessToken = jwt.sign({ id: newUser.id }, process.env.SECRET_KEY, {
            expiresIn: '1h', // Set the token expiration
        });

        // Set the access token as a cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            // Other cookie options (secure, sameSite, etc.)
        });

        // Respond with user data and access token
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    created_at: newUser.created_at,
                },
                meta: {
                    access_token: accessToken,
                },
            },
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            error: 'Error creating user',
        });
    }
});

// POST /v1/auth/signin
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Finding the user by email
        const user = await User.findOne({ email });

        // If the user is not found or the password is incorrect, respond with an error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: false,
                error: 'Invalid credentials',
            });
        }

        // Create and sign a JWT token
        const accessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: '1h', // Set the token expiration
        });

        // Set the access token as a cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            // Other cookie options (secure, sameSite, etc.)
        });

        // Respond with user data and access token
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
                meta: {
                    access_token: accessToken,
                },
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            error: 'Error signin user',
        });
    }
});

router.get("/me", verifyAccessToken, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.userId });

        if (!user) {
            return res.status(404).json({
                status: false,
                error: 'User not found',
            });
        }

        // Respond with user data
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            error: 'Error fetching user details',
        });
    }
});

module.exports = router;