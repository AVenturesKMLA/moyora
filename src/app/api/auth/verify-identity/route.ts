import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

export async function POST(request: NextRequest) {
    try {
        const { identityVerificationId } = await request.json();

        if (!identityVerificationId) {
            return NextResponse.json(
                { success: false, message: '인증 ID가 누락되었습니다.' },
                { status: 400 }
            );
        }

        if (!PORTONE_API_SECRET) {
            console.error('PORTONE_API_SECRET is not defined');
            return NextResponse.json(
                { success: false, message: '서버 설정 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // Call PortOne Single Identity Verification API
        const response = await fetch(
            `https://api.portone.io/identity-verifications/${encodeURIComponent(identityVerificationId)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `PortOne ${PORTONE_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('PortOne API Error:', errorData);
            return NextResponse.json(
                { success: false, message: '본인인증 정보 조회에 실패했습니다.' },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.status !== 'VERIFIED') {
            return NextResponse.json(
                { success: false, message: '본인인증이 완료되지 않았습니다.', status: data.status },
                { status: 400 }
            );
        }

        // Return verified customer info
        // Properties available in verifiedCustomer: name, gender, birthDate, phone, ci, di, etc.
        const { name, birthDate, phone } = data.verifiedCustomer;

        // Normalizing birthday to YYYY-MM-DD if needed (PortOne birthDate is usually YYYY-MM-DD)
        const normalizedBirthday = birthDate;

        // Check if user already exists with this phone number
        // await connectDB();
        // const existingUser = await User.findOne({ phone });

        // if (existingUser) {
        //     return NextResponse.json(
        //         {
        //             success: false,
        //             message: '이미 등록된 전화번호 입니다. 기존 계정으로 로그인해 주세요.',
        //             code: 'PHONE_ALREADY_EXISTS'
        //         },
        //         { status: 409 }
        //     );
        // }

        return NextResponse.json({
            success: true,
            data: {
                name,
                birthday: normalizedBirthday,
                phone
            }
        });

    } catch (error: any) {
        console.error('Identity Verification Backend Error:', error);
        return NextResponse.json(
            { success: false, message: '서버 내부 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
