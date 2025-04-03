// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//     try {
//         console.log('Auth middleware executing...');

//         // Extract token from request headers
//         const authHeader = req.header('Authorization');
//         if (!authHeader) {
//             return res.status(401).json({ error: 'No token provided.' });
//         }

//         const token = authHeader.replace('Bearer ', '');
//         console.log('Received token:', token);

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('Decoded token:', decoded);

//         // Find user by ID instead of email
//         const user = await User.findById(decoded.user.id);
//         if (!user) {
//             return res.status(401).json({ error: 'User not found.' });
//         }

//         // Store only essential user data in req.user
//         req.user = { id: user._id, role: user.role };

//         console.log('User authenticated:', req.user);
//         next();
//     } catch (err) {
//         console.error('Authentication error:', err.message);
//         return res.status(401).json({ error: 'Invalid token. Authentication failed.' });
//     }
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    // const token = req.header("Authorization");
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded.user;
        // req.user = await User.findById(decoded.id).select("-password");

         // Find user by ID instead of email
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        // Store only essential user data in req.user
        req.user = { id: user._id, role: user.role,email: user.email,name:user.name,team_id:user.team_id};

        // console.log('User authenticated:', req.user);

        // console.log("User Id:", req.user.id); // Debugging step

        if (req.user.role !== "team-lead" && req.user.role !== "employee") {
            return res.status(403).json({ error: "Access denied." });
        }
        

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        res.status(400).json({ error: "Invalid token." });
    }
};


// const authMiddleware = async (req, res, next) => {
//     try {
//         const token = req.header("Authorization");
//         if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

//         // Remove 'Bearer ' prefix if present
//         const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

//         // Verify token
//         const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

//         // Find user by ID
//         const user = await User.findById(decoded.id).select("-password");
//         if (!user) {
//             return res.status(401).json({ error: "User not found." });
//         }

//         // Store only essential user data in req.user
//         req.user = { id: user._id, role: user.role, email: user.email };

//         // Role-based access control
//         if (!["team-lead", "employee"].includes(req.user.role)) {
//             return res.status(403).json({ error: "Access denied." });
//         }

//         next();
//     } catch (err) {
//         res.status(400).json({ error: "Invalid token." });
//     }
// };
module.exports = authMiddleware;
