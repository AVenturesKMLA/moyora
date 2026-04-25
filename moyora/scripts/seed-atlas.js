const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// URI from .env file
const MONGODB_URI = 'mongodb+srv://choidoyoun:c07141M@cluster0moyora.ygdtvkv.mongodb.net/?appName=Cluster0moyora';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    birthday: { type: Date, required: true },
    schoolName: { type: String, required: true },
    schoolId: { type: String, required: true },
    role: { type: String, default: 'user' },
    agreedToTerms: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
    try {
        console.log('Connecting to Atlas...');
        // Added some connection options for stability
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB Atlas');

        const hashedPassword = await bcrypt.hash('dev1234!', 12);
        let createdCount = 0;
        let skippedCount = 0;

        for (let i = 1; i <= 10; i++) {
            const email = `dev${i}@moyeora.kr`;
            const existing = await User.findOne({ email });

            if (existing) {
                console.log(`Skipping ${email} (already exists)`);
                skippedCount++;
                continue;
            }

            await User.create({
                name: `개발자지원${i}`,
                email: email,
                password: hashedPassword,
                birthday: new Date('2000-01-01'),
                phone: `010-0000-${String(i).padStart(4, '0')}`,
                schoolName: '모여라 개발팀',
                schoolId: 'DEV-TEAM',
                role: 'user',
                agreedToTerms: true,
            });
            console.log(`Created ${email}`);
            createdCount++;
        }

        console.log(`Done! Created ${createdCount} users. Skipped ${skippedCount}.`);
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding Atlas:', error);
        process.exit(1);
    }
}

seed();
