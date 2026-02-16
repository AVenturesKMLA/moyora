const mongoose = require('mongoose');

// URI from .env file
const MONGODB_URI = 'mongodb+srv://choidoyoun:c07141M@cluster0moyora.ygdtvkv.mongodb.net/?appName=Cluster0moyora';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to Atlas for verification');

        const emails = [];
        for (let i = 1; i <= 10; i++) {
            emails.push(`dev${i}@moyeora.kr`);
        }

        const count = await User.countDocuments({ email: { $in: emails } });
        console.log(`Found ${count} out of 10 test accounts.`);

        if (count === 10) {
            console.log('ALL ACCOUNTS CONFIRMED.');
        } else {
            console.log('MISSING ACCOUNTS.');
            const found = await User.find({ email: { $in: emails } }).select('email');
            const foundEmails = found.map(u => u.email);
            const missing = emails.filter(e => !foundEmails.includes(e));
            console.log('Missing:', missing);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

verify();
