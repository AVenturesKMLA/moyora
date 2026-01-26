import { z } from 'zod';

// User Signup Schema
export const signupSchema = z.object({
    name: z
        .string()
        .min(2, '이름은 2자 이상 입력해주세요')
        .max(50, '이름은 50자 이하로 입력해주세요'),
    email: z
        .string()
        .email('올바른 이메일 형식을 입력해주세요'),
    password: z
        .string()
        .min(8, '비밀번호는 8자 이상이어야 합니다')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'
        ),
    confirmPassword: z.string(),
    birthday: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), '올바른 날짜를 입력해주세요'),
    phone: z
        .string()
        .min(10, '올바른 전화번호를 입력해주세요'),
    schoolName: z
        .string()
        .min(2, '학교명을 입력해주세요'),
    schoolId: z
        .string()
        .min(1, '학교 고유 ID가 필요합니다'),
    agreedToTerms: z
        .boolean()
        .refine((val) => val === true, '이용약관에 동의해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
});

// Login Schema
export const loginSchema = z.object({
    email: z
        .string()
        .email('올바른 이메일 형식을 입력해주세요'),
    password: z
        .string()
        .min(1, '비밀번호를 입력해주세요'),
});

// Club Registration Schema
export const clubSchema = z.object({
    schoolName: z
        .string()
        .min(2, '학교명을 입력해주세요'),
    schoolId: z
        .string()
        .min(1, '학교 고유 ID가 필요합니다'),
    clubTheme: z
        .string()
        .min(2, '동아리 분야를 입력해주세요'),
    clubName: z
        .string()
        .min(2, '동아리명을 입력해주세요'),
    presidentName: z
        .string()
        .min(2, '회장 이름을 입력해주세요'),
    presidentEmail: z
        .string()
        .email('올바른 이메일 형식을 입력해주세요'),
    presidentPhone: z
        .string()
        .min(10, '올바른 전화번호를 입력해주세요')
        .max(15, '올바른 전화번호를 입력해주세요')
        .regex(/^01[0-9][-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/, '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'),
    clubEmail: z
        .string()
        .email('올바른 이메일 형식을 입력해주세요')
        .optional()
        .or(z.literal('')),
});

// Contest Schema
export const contestSchema = z.object({
    contestName: z
        .string()
        .min(2, '대회명을 입력해주세요'),
    schoolId: z
        .string()
        .min(1, '학교 고유 ID가 필요합니다'),
    contestType: z
        .string()
        .min(1, '대회 유형을 선택해주세요'),
    contestDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), '올바른 날짜를 입력해주세요'),
    contestPlace: z
        .string()
        .min(2, '대회 장소를 입력해주세요'),
    description: z
        .string()
        .min(10, '대회 설명을 10자 이상 입력해주세요'),
    enteringClubs: z
        .string()
        .optional(),
    notices: z
        .string()
        .optional(),
    hostName: z
        .string()
        .min(2, '주최자 이름을 입력해주세요'),
    hostPhone: z
        .string()
        .min(10, '올바른 전화번호를 입력해주세요')
        .max(15, '올바른 전화번호를 입력해주세요')
        .regex(/^01[0-9][-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/, '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'),
});

// Forum Schema
export const forumSchema = z.object({
    forumName: z
        .string()
        .min(2, '포럼명을 입력해주세요'),
    schoolId: z
        .string()
        .min(1, '학교 고유 ID가 필요합니다'),
    forumType: z
        .string()
        .min(1, '포럼 유형을 선택해주세요'),
    forumDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), '올바른 날짜를 입력해주세요'),
    forumPlace: z
        .string()
        .min(2, '포럼 장소를 입력해주세요'),
    description: z
        .string()
        .min(10, '포럼 설명을 10자 이상 입력해주세요'),
    forumClubs: z
        .string()
        .optional(),
    notices: z
        .string()
        .optional(),
    hostName: z
        .string()
        .min(2, '주최자 이름을 입력해주세요'),
    hostPhone: z
        .string()
        .min(10, '올바른 전화번호를 입력해주세요')
        .max(15, '올바른 전화번호를 입력해주세요')
        .regex(/^01[0-9][-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/, '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'),
});

// Co-Research Schema
export const coResearchSchema = z.object({
    researchName: z
        .string()
        .min(2, '공동연구명을 입력해주세요'),
    schoolId: z
        .string()
        .min(1, '학교 고유 ID가 필요합니다'),
    researchType: z
        .string()
        .min(1, '연구 분야를 선택해주세요'),
    researchDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), '올바른 날짜를 입력해주세요'),
    researchPlace: z
        .string()
        .min(2, '연구 장소를 입력해주세요'),
    description: z
        .string()
        .min(10, '연구 설명을 10자 이상 입력해주세요'),
    joiningClubs: z
        .string()
        .optional(),
    notices: z
        .string()
        .optional(),
    hostName: z
        .string()
        .min(2, '주최자 이름을 입력해주세요'),
    hostPhone: z
        .string()
        .min(10, '올바른 전화번호를 입력해주세요')
        .max(15, '올바른 전화번호를 입력해주세요')
        .regex(/^01[0-9][-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/, '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ClubInput = z.infer<typeof clubSchema>;
export type ContestInput = z.infer<typeof contestSchema>;
export type ForumInput = z.infer<typeof forumSchema>;
export type CoResearchInput = z.infer<typeof coResearchSchema>;
