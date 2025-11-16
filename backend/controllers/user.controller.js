// controllers/user.controller.js
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = {
    // Register a new user
    newUser: async (req, res) => {
        try {
            const { name, email, password, photo } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Hashear a senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = new User({
                name,
                email,
                password: hashedPassword,
                photo,
            });

            await user.save();

            // Retorna token JWT seguro
            res.status(201).json({
                id: user._id,
                name: user.name,
                email: user.email,
                photo: user.photo,
                token: generateToken(user._id),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    // Login
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ message: "Invalid credentials" });

            const isMatch = await user.matchPassword(password);
            if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                photo: user.photo,
                token: generateToken(user._id),
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },


    // Get all users (protected)
    getUsers: async (req, res) => {
        try {
            const users = await User.find().select("-password"); // exclude password
            res.json(users);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};
