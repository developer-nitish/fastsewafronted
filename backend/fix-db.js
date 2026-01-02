const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Drop the problematic index
        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Try to drop the username index
        try {
            await collection.dropIndex('username_1');
            console.log('✅ Dropped old username index');
        } catch (error) {
            console.log('ℹ️ Username index not found or already dropped');
        }

        // Clear all users (optional - only if you want to start fresh)
        // await collection.deleteMany({});
        // console.log('✅ Cleared all users');

        console.log('✅ Database fixed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    }
};

fixDatabase();