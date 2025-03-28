// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const generateAccessKey = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};



const signup = async (req, res) => {
    const { name, email, password, role, team_id } = req.body;
    let teamId = team_id; // Assign input team_id if employee

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Assign team_id based on role
        if (role === "team-lead") {
            teamId = generateAccessKey(); // Generate new team_id for team-lead
        } else if (role === "employee" && !team_id) {
            return res.status(400).json({ message: "Team ID is required for employees" });
        }

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({ name, email, password: hashedPassword, role, team_id: teamId });
        await newUser.save();

        // Generate JWT token
        const payload = { user: { id: newUser.id, role: newUser.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });

        res.status(201).json({ 
            message: "User registered successfully", 
            token, 
            team_id: teamId 
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const payload = { user: { id: user.id, role: user.role,name:user.name ,email:user.email} };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.status(200).json({ message: 'Login successful', token, role: user.role, team_id: user.team_id,name:user.name,email:user.email  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { signup, login };
