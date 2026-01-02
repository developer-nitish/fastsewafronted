const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Middleware
const corsOriginEnv = process.env.CORS_ORIGIN;
const corsOrigin = corsOriginEnv
    ? corsOriginEnv.split(',').map((o) => o.trim()).filter(Boolean)
    : true; // reflect request origin by default

app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const chatRoutes = require('./routes/chatRoutes');

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
app.use('/api', chatRoutes);

// Serve static frontend (single-deploy friendly)
// Frontend lives one level up from /backend
const frontendDir = path.join(__dirname, '..');

// Prevent accidentally serving backend source files
app.use('/backend', (req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
});

app.use(express.static(frontendDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`   Health Check: /api/health`);
    console.log(`   Register: POST /api/auth/register`);
    console.log(`   Login: POST /api/auth/login`);
    console.log(`💡 Frontend is served from / (same-origin /api)`);
});