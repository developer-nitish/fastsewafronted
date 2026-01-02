const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');

        const mongoUri =
            process.env.MONGODB_URI ||
            process.env.MONGO_URI ||
            'mongodb://localhost:27017/fastsewa';

        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database: ${conn.connection.db.databaseName}`);

        // Create initial admin user if not exists
        await createInitialData();

        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('\n🔧 Please make sure your MongoDB connection string is set.');
        console.log('   Use env var MONGODB_URI (or MONGO_URI).');

        process.exit(1);
    }
};

async function createInitialData() {
    const User = require('../models/User');

    try {
        // Check if admin user exists
        const adminExists = await User.findOne({ email: 'admin@fastsewa.com' });

        if (!adminExists) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await User.create({
                firstName: 'Admin',
                lastName: 'FastSewa',
                email: 'admin@fastsewa.com',
                phone: '1234567890',
                password: hashedPassword,
                userType: 'service_provider'
            });

            console.log('👤 Created default admin user: admin@fastsewa.com / admin123');
        }

        const userCount = await User.countDocuments();
        console.log(`📊 Total Users: ${userCount}`);

    } catch (error) {
        console.log('Note: Could not create initial data, continuing...');
    }
}

module.exports = connectDB;