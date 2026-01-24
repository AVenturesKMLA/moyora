import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Contest, Forum, CoResearch, Schedule, User } from '@/models';
import bcrypt from 'bcryptjs';

// POST - Seed sample data for testing
export async function POST() {
    try {
        await connectDB();

        // Drop stale username index if it exists (from old schema)
        try {
            await User.collection.dropIndex('username_1');
        } catch {
            // Index doesn't exist, ignore
        }

        // Drop stale name index from clubs collection if it exists
        const Club = (await import('@/models/Club')).default;
        try {
            await Club.collection.dropIndex('name_1');
        } catch {
            // Index doesn't exist, ignore
        }

        // Create Super Admin if not exists
        let superAdmin = await User.findOne({ email: 'admin@moyeora.kr' });
        if (!superAdmin) {
            const adminPassword = await bcrypt.hash('admin1234', 12);
            superAdmin = await User.create({
                name: '슈퍼관리자',
                email: 'admin@moyeora.kr',
                password: adminPassword,
                birthday: new Date('1990-01-01'),
                schoolName: '모여라 운영팀',
                role: 'superadmin',
                agreedToTerms: true,
            });
        }

        // Create a test user if not exists
        let testUser = await User.findOne({ email: 'test@school.kr' });
        if (!testUser) {
            const hashedPassword = await bcrypt.hash('test1234', 12);
            testUser = await User.create({
                name: '김테스트',
                email: 'test@school.kr',
                password: hashedPassword,
                birthday: new Date('2008-03-15'),
                schoolName: '서울과학고등학교',
                role: 'user',
                agreedToTerms: true,
            });
        }

        // Sample Contests
        const contests = [
            {
                userId: testUser._id,
                contestName: '제15회 전국 고등학생 과학 토론 대회',
                contestType: '토론',
                contestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                contestPlace: '서울시 강남구 COEX 컨벤션센터',
                description: '전국의 과학 동아리 학생들이 모여 최신 과학 이슈에 대해 토론하는 대회입니다. 올해 주제는 "인공지능과 인류의 미래"입니다.',
                enteringClubs: ['과학탐구반', '물리동아리', 'AI연구회'],
                notices: '참가비 무료, 점심 제공, 우수상 이상 수상자에게 과학전람회 추천 기회 제공',
                hostName: '박선생',
                hostPhone: '010-1234-5678',
            },
            {
                userId: testUser._id,
                contestName: '청소년 창업 아이디어 경진대회',
                contestType: '발표',
                contestDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                contestPlace: '부산 해운대 BEXCO',
                description: '창의적인 창업 아이디어를 가진 청소년들의 발표 대회입니다. 실현 가능성과 혁신성을 평가합니다.',
                enteringClubs: ['창업동아리', '경제연구회'],
                notices: '팀 단위 참가, 최대 4인 1팀, 사업계획서 필수 제출',
                hostName: '이담당',
                hostPhone: '010-2345-6789',
            },
            {
                userId: testUser._id,
                contestName: '전국 고등학교 수학 올림피아드',
                contestType: '실험',
                contestDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                contestPlace: '대전 카이스트 강당',
                description: '수학적 사고력과 문제 해결 능력을 겨루는 대회입니다. 개인전과 단체전이 있습니다.',
                enteringClubs: ['수학동아리', 'MATHLAB'],
                notices: '계산기 사용 불가, 개인 필기구 지참',
                hostName: '최교수',
                hostPhone: '010-3456-7890',
            },
        ];

        // Sample Forums
        const forums = [
            {
                userId: testUser._id,
                forumName: '청소년 환경 보호 포럼 2026',
                forumType: '세미나',
                forumDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                forumPlace: '온라인 (Zoom)',
                description: '기후변화와 환경 문제에 대해 청소년들이 함께 논의하고 해결책을 모색하는 포럼입니다. 전문가 강연과 패널 토론이 진행됩니다.',
                forumClubs: ['환경동아리', '지구지킴이'],
                notices: '참가 링크는 이메일로 발송됩니다. 마이크와 카메라 필수',
                hostName: '정환경',
                hostPhone: '010-4567-8901',
            },
            {
                userId: testUser._id,
                forumName: '글로벌 리더십 네트워킹 데이',
                forumType: '네트워킹',
                forumDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
                forumPlace: '서울 명동 롯데호텔',
                description: '전국 고등학교 학생회장들이 모여 리더십 경험을 공유하고 네트워킹하는 행사입니다.',
                forumClubs: ['학생회', '토론부'],
                notices: '정장 착용 권장, 명함 교환 시간 포함',
                hostName: '강회장',
                hostPhone: '010-5678-9012',
            },
        ];

        // Sample Co-Research
        const coResearchProjects = [
            {
                userId: testUser._id,
                researchName: '고등학생 AI 윤리 연구 프로젝트',
                researchType: '기술',
                researchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now (deadline)
                researchPlace: '온라인 협업 (Discord + Notion)',
                description: 'AI 기술 발전에 따른 윤리적 문제를 청소년 시각에서 연구합니다. 논문 작성 및 학술대회 발표를 목표로 합니다.',
                joiningClubs: ['AI연구회', '철학동아리', '컴퓨터부'],
                notices: '주 1회 온라인 미팅, 개인 연구 시간 별도 필요',
                hostName: '임연구',
                hostPhone: '010-6789-0123',
            },
            {
                userId: testUser._id,
                researchName: '지역 하천 수질 모니터링 공동 연구',
                researchType: '환경',
                researchDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
                researchPlace: '각 학교 인근 하천 + 온라인 데이터 공유',
                description: '여러 학교가 협력하여 지역 하천의 수질을 장기 모니터링하는 시민과학 프로젝트입니다.',
                joiningClubs: ['환경과학반', '생물동아리'],
                notices: '수질 검사 키트 각 학교에 배송 예정',
                hostName: '윤과학',
                hostPhone: '010-7890-1234',
            },
        ];

        // Insert contests
        for (const contestData of contests) {
            const existingContest = await Contest.findOne({ contestName: contestData.contestName });
            if (!existingContest) {
                const contest = await Contest.create(contestData);
                await Schedule.create({
                    eventType: 'contest',
                    eventId: contest._id,
                    eventName: contest.contestName,
                    eventDate: contest.contestDate,
                    eventPlace: contest.contestPlace,
                    isPublic: true,
                });
            }
        }

        // Insert forums
        for (const forumData of forums) {
            const existingForum = await Forum.findOne({ forumName: forumData.forumName });
            if (!existingForum) {
                const forum = await Forum.create(forumData);
                await Schedule.create({
                    eventType: 'forum',
                    eventId: forum._id,
                    eventName: forum.forumName,
                    eventDate: forum.forumDate,
                    eventPlace: forum.forumPlace,
                    isPublic: true,
                });
            }
        }

        // Insert co-research
        for (const researchData of coResearchProjects) {
            const existingResearch = await CoResearch.findOne({ researchName: researchData.researchName });
            if (!existingResearch) {
                const research = await CoResearch.create(researchData);
                await Schedule.create({
                    eventType: 'co-research',
                    eventId: research._id,
                    eventName: research.researchName,
                    eventDate: research.researchDate,
                    eventPlace: research.researchPlace,
                    isPublic: true,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: '샘플 데이터가 생성되었습니다',
            data: {
                superAdmin: { email: 'admin@moyeora.kr', password: 'admin1234', role: 'superadmin' },
                testUser: { email: 'test@school.kr', password: 'test1234', role: 'user' },
                contests: contests.length,
                forums: forums.length,
                coResearch: coResearchProjects.length,
            },
        });
    } catch (error) {
        console.error('Seed data error:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        return NextResponse.json(
            { success: false, message: '샘플 데이터 생성 중 오류가 발생했습니다', error: errorMessage },
            { status: 500 }
        );
    }
}
