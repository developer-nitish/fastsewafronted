const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 FastSewa Local Setup');
console.log('======================\n');

// Create necessary folders
const folders = ['config', 'models', 'controllers', 'routes', 'utils'];
folders.forEach(folder => {
    const folderPath = path.join(__dirname, folder);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`✅ Created folder: ${folder}`);
    }
});

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/fastsewa
JWT_SECRET=fastsewa-local-dev-secret-key-2024
NODE_ENV=development`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
} else {
    console.log('✅ .env file already exists');
}

// Check if package.json exists
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json not found. Creating...');

    const packageContent = {
        name: "fastsewa-backend",
        version: "1.0.0",
        description: "FastSewa Backend for Local Development",
        main: "server.js",
        scripts: {
            start: "node server.js",
            dev: "nodemon server.js",
            setup: "node setup.js"
        },
        dependencies: {
            express: "^4.18.2",
            mongoose: "^7.6.3",
            bcryptjs: "^2.4.3",
            jsonwebtoken: "^9.0.2",
            cors: "^2.8.5",
            dotenv: "^16.3.1"
        },
        devDependencies: {
            nodemon: "^3.0.1"
        }
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
    console.log('✅ Created package.json');
}

console.log('\n📋 Setup complete!');
console.log('\n🎯 Next Steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start MongoDB service');
console.log('3. Run backend: npm run dev');
console.log('4. Test at: http://localhost:5000/api/health');
console.log('\n💡 For MongoDB on Windows:');
console.log('   - Open Command Prompt as Administrator');
console.log('   - Run: net start MongoDB');
console.log('\n💡 For MongoDB on Mac:');
console.log('   - Run: brew services start mongodb-community@7.0');