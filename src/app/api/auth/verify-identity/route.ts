import { NextRequest, NextResponse } from 'next/server';

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

        return NextResponse.json({
            success: true,
            data: {
                name,
                birthday: birthDate,
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
