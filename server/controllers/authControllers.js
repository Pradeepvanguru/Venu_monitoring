// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');


const generateAccessKey = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });



const signup = async (req, res) => {
    let { name, email, password, role, teamId } = req.body; // Use let for teamId

    try {
        // Ensure a file is uploaded before proceeding
        if (!req.file) {
            return res.status(400).json({ message: "Profile photo is required" });
        }
        const fileUrl = req.file.path; // Get uploaded file path

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Assign team_id based on role
        if (role === "team-lead") {
            teamId = generateAccessKey(); // Assign new teamId
        } else if (role === "employee" && !teamId) {
            return res.status(400).json({ message: "Team ID is required for employees" });
        }
        else if (role === "employee" && teamId) {
        const idverify = await User.findOne({ team_id: teamId });
        if (!idverify) {
        return res.status(400).json({ message: "Team ID is not In DB" });
       }
      }

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            team_id: teamId,
            profilePhoto: fileUrl // Correctly store uploaded file path
        });

        await newUser.save();

        // Generate JWT token
        const payload = { user: { id: newUser.id, role: newUser.role, name: newUser.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6h" });

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
    const { email, password,role } = req.body;

    try {
        const user = await User.findOne({ email,role:role});
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials or role. Please check your email and role.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password.Please check once !' });
        }

        const payload = { user: { id: user._id, role: user.role,name:user.name ,email:user.email} };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6h' });

        res.status(200).json({ message: 'Login successful', token, role: user.role, team_id: user.team_id,name:user.name,email:user.email ,userId:user._id  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { signup, login };
