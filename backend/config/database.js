const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Connecting to local MongoDB...');

        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastsewa', {
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
        console.log('\n🔧 Please make sure:');
        console.log('1. MongoDB is installed on your computer');
        console.log('2. MongoDB service is running');
        console.log('3. For Windows: Run "net start MongoDB" as Administrator');
        console.log('4. For Mac: Run "brew services start mongodb-community@7.0"');

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