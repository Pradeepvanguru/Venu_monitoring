// backend/routes/auth.js
const express = require('express');
const { signup, login } = require('../controllers/authControllers');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/authMiddleware');
const transporter = require('../util/transporter')



const router = express.Router();


// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Register User (Team Lead or Employee)
router.post('/signup', 
    upload.single('profile'), // Specify 'profile' field for file upload
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        check('role', 'Role must be either team-lead or employee').isIn(['team-lead', 'employee'])
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await signup(req, res);
    }
);

// Login User
router.post('/login', 
    [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
]
, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    login(req, res);
});




router.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Construct the full URL
        const profileUrl = `${req.protocol}://${req.get('host')}/${user.profilePhoto}`;

        res.json({ ...user._doc, profilePhoto: profileUrl });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.put('/api/updateProfile', authMiddleware, upload.single('profilePhoto'), async (req, res) => {
    try {
        // console.log("Request User:", req.user); // Debugging

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found' });
        }

        const { name, email, team_id } = req.body;
        const updateFields = { name, email, team_id };

        if (req.file) {
            updateFields.profilePhoto = `uploads/${req.file.filename}`;
        }

        // console.log("pic",updateFields.profilePhoto)
        

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true, runValidators: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});


// Update password
router.put('/api/updatePassword', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Both old and new passwords are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare old password with the stored hashed password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Hash the new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password' });
    }
});

router.delete('/api/deleteAccount', authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found' });
        }

        // Delete user from the database
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ message: 'Server error, please try again' });
    }
});





//oforgote password

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    otp: String,
    otpExpiry: Date,
  });
  
  const Forgot = mongoose.model("forgot", UserSchema);
  
  // Route to send OTP
  router.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
   
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000); // OTP valid for 5 minutes
    const client= await Forgot.findOne({email})
   if(!client){
    const forgot = new Forgot({ email, otp, otpExpiry });
    await forgot.save();
   }
    await Forgot.updateOne({ email }, { otp, otpExpiry });
   
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };
  
    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ message: "Failed to send OTP" });
      res.json({ message: "OTP sent successfully" });
    });
  });
  
  // Route to verify OTP
  router.post("/api/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    const user = await Forgot.findOne({ email });
  
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    res.json({ message: "OTP verified successfully" });
  });
  
  router.post("/api/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" }); // Return response here
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.updateOne(
        { email },
        { password: hashedPassword, otp: null, otpExpiry: null }
      );
  
      return res.json({ message: "Password reset successfully", role: user.role }); // Send response once
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  



module.exports = router;
