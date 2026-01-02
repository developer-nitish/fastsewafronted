const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for local development
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FastSewa API is running locally',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Welcome endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to FastSewa Local API',
        endpoints: {
            auth: '/api/auth',
            services: '/api/services',
            health: '/api/health'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Register: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`\n💡 Frontend should connect to: http://localhost:${PORT}/api`);
});