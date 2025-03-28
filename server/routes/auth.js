// backend/routes/auth.js
const express = require('express');
const { signup, login } = require('../controllers/authControllers');
const { check, validationResult } = require('express-validator');

const router = express.Router();

// Register User (Team Lead or Employee)
router.post('/signup', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either team-lead or employee').isIn(['team-lead', 'employee'])
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    signup(req, res);
});

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

module.exports = router;
