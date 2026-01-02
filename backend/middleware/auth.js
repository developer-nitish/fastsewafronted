const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new Error();
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Please authenticate'
        });
    }
};

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
};

// Service provider middleware
const serviceProvider = (req, res, next) => {
    if (req.user && ['service_provider', 'admin'].includes(req.user.userType)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Service providers only.'
        });
    }
};

module.exports = { auth, admin, serviceProvider };