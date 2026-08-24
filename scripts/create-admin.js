/**
 * 슈퍼관리자 계정 생성/승격 스크립트
 *
 * 사용법:
 *   node scripts/create-admin.js <이메일> <비밀번호> [이름]
 *
 * 예시:
 *   node scripts/create-admin.js admin@moyeora.kr 'StrongPass!234' 운영자
 *
 * 이미 같은 이메일의 계정이 있으면 비밀번호를 새로 설정하고 role을 superadmin으로 승격합니다.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// .env.local 에서 MONGODB_URI 읽기 (dotenv 미설치 환경 대응)
function loadEnvLocal() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) return {};
    return fs
        .readFileSync(envPath, 'utf8')
        .split('\n')
        .reduce((acc, line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return acc;
            const eq = trimmed.indexOf('=');
            if (eq === -1) return acc;
            const key = trimmed.slice(0, eq).trim();
            let value = trimmed.slice(eq + 1).trim();
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            acc[key] = value;
            return acc;
        }, {});
}

const env = loadEnvLocal();
const MONGODB_URI = process.env.MONGODB_URI || env.MONGODB_URI;

const [email, password, name] = process.argv.slice(2);

if (!email || !password) {
    console.error('사용법: node scripts/create-admin.js <이메일> <비밀번호> [이름]');
    process.exit(1);
}

if (password.length < 8) {
    console.error('비밀번호는 8자 이상이어야 합니다.');
    process.exit(1);
}

if (!MONGODB_URI) {
    console.error('MONGODB_URI를 찾을 수 없습니다. .env.local을 확인해주세요.');
    process.exit(1);
}

// src/models/User.ts 와 동일한 필드 구성 (스크립트 실행용 최소 스키마)
const userSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true, lowercase: true, trim: true },
        password: String,
        phone: { type: String, unique: true },
        birthday: Date,
        schoolName: String,
        schoolId: String,
        grade: Number,
        interests: { type: [String], default: [] },
        role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
        agreedToTerms: { type: Boolean, default: false },
        clubRecommendPreference: { type: String, default: 'popular' },
        careerInterest: { type: String, default: '' },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
    console.log('MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('연결됨.');

    const normalizedEmail = email.toLowerCase().trim();
    const hashed = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
        existing.password = hashed;
        existing.role = 'superadmin';
        if (name) existing.name = name;
        await existing.save();
        console.log(`\n✅ 기존 계정을 슈퍼관리자로 승격했습니다.`);
        console.log(`   이메일: ${existing.email}`);
        console.log(`   이름:   ${existing.name}`);
        console.log(`   역할:   ${existing.role}`);
        console.log(`   (비밀번호도 입력하신 값으로 재설정되었습니다)`);
    } else {
        // phone은 unique 인덱스가 걸려 있어 충돌하지 않도록 생성
        const created = await User.create({
            name: name || '운영자',
            email: normalizedEmail,
            password: hashed,
            phone: `admin-${Date.now()}`,
            schoolName: '모여라 운영팀',
            schoolId: 'ADMIN',
            interests: [],
            role: 'superadmin',
            agreedToTerms: true,
        });
        console.log(`\n✅ 슈퍼관리자 계정을 생성했습니다.`);
        console.log(`   이메일: ${created.email}`);
        console.log(`   이름:   ${created.name}`);
        console.log(`   역할:   ${created.role}`);
    }

    console.log(`\n로그인 후 /admin/clubs 에서 동아리를 삭제할 수 있습니다.\n`);
    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error('\n❌ 실패:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
