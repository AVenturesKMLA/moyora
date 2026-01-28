
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TargetType, SchoolType } from '@/data/demoData';

interface NewCollabModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        title: string;
        type: string;
        dateStart: string;
        dateEnd?: string;
        time?: string;
        method: 'offline' | 'online';
        address?: string;
        onlineInfo?: string;
        region: string;
        notes?: string;
        targetType?: TargetType;
        targetSchoolTypes?: SchoolType[];
        targetSpecificSchools?: string;
    }) => void;
}

const SCHOOL_TYPES: SchoolType[] = [
    '전국 단위 자사고',
    '서울 자사고',
    '외고',
    '국제고',
    '특성화고',
    '영재고',
    '과학고',
];

export function NewCollabModal({ open, onOpenChange, onSubmit }: NewCollabModalProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [time, setTime] = useState('');
    const [method, setMethod] = useState<'offline' | 'online'>('offline');
    const [address, setAddress] = useState('');
    const [onlineInfo, setOnlineInfo] = useState('');
    const [region, setRegion] = useState('');
    const [notes, setNotes] = useState('');
    const [targetType, setTargetType] = useState<TargetType>('nationwide');
    const [selectedSchoolTypes, setSelectedSchoolTypes] = useState<SchoolType[]>([]);
    const [specificSchools, setSpecificSchools] = useState('');

    const handleSubmit = () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요');
            return;
        }
        if (!dateStart) {
            alert('시작일을 선택해주세요');
            return;
        }
        if (method === 'offline' && !address.trim()) {
            alert('오프라인 장소를 입력해주세요');
            return;
        }

        onSubmit({
            title: title.trim(),
            type: type || '기타',
            dateStart,
            dateEnd: dateEnd || undefined,
            time: time.trim() || undefined,
            method,
            address: method === 'offline' ? address.trim() : undefined,
            onlineInfo: method === 'online' ? onlineInfo.trim() : undefined,
            region: method === 'online' ? '온라인' : (region.trim() || '전국'),
            notes: notes.trim() || undefined,
            targetType,
            targetSchoolTypes: targetType === 'school_type' ? selectedSchoolTypes : undefined,
            targetSpecificSchools: targetType === 'specific' ? specificSchools.trim() : undefined,
        });

        // Reset form
        setTitle('');
        setType('');
        setDateStart('');
        setDateEnd('');
        setTime('');
        setMethod('offline');
        setAddress('');
        setOnlineInfo('');
        setRegion('');
        setNotes('');
        setTargetType('nationwide');
        setSelectedSchoolTypes([]);
        setSpecificSchools('');
        onOpenChange(false);
    };

    const toggleSchoolType = (schoolType: SchoolType) => {
        setSelectedSchoolTypes(prev =>
            prev.includes(schoolType)
                ? prev.filter(t => t !== schoolType)
                : [...prev, schoolType]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] bg-card border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-extrabold text-foreground">모집 올리기</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        입력하면 로컬스토리지에 저장됩니다. (데모)
                    </div>

                    <div className="h-px bg-border" />

                    <div className="space-y-3">
                        {/* 제목 */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                            <div className="text-sm text-muted-foreground">제목</div>
                            <Input
                                placeholder="예: 전국 BM 케이스 스프린트"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* 유형 */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                            <div className="text-sm text-muted-foreground">유형</div>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="통합 대회">통합 대회</SelectItem>
                                    <SelectItem value="연합 포럼">연합 포럼</SelectItem>
                                    <SelectItem value="공동 연구">공동 연구</SelectItem>
                                    <SelectItem value="기타">기타</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 일시 */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                            <div className="text-sm text-muted-foreground">일시</div>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => setDateStart(e.target.value)}
                                />
                                <span className="self-center">~</span>
                                <Input
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 시간 (선택) */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                            <div className="text-sm text-muted-foreground">시간</div>
                            <Input
                                placeholder="선택사항 (예: 14:00)"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>

                        {/* 방법 */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                            <div className="text-sm text-muted-foreground">방법</div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={method === 'offline' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMethod('offline')}
                                >
                                    오프라인
                                </Button>
                                <Button
                                    type="button"
                                    variant={method === 'online' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMethod('online')}
                                >
                                    온라인
                                </Button>
                            </div>
                        </div>

                        {/* 오프라인 주소 */}
                        {method === 'offline' && (
                            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                                <div className="text-sm text-muted-foreground">장소</div>
                                <Input
                                    placeholder="구체적인 주소 입력"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        )}

                        {/* 온라인 정보 */}
                        {method === 'online' && (
                            <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                                <div className="text-sm text-muted-foreground pt-2">접속 정보</div>
                                <Textarea
                                    className="min-h-[80px] resize-none"
                                    placeholder="회의 링크, ID, 비밀번호 등 자유롭게 입력"
                                    value={onlineInfo}
                                    onChange={(e) => setOnlineInfo(e.target.value)}
                                />
                            </div>
                        )}

                        {/* 지역 - 오프라인일 때만 */}
                        {method === 'offline' && (
                            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                                <div className="text-sm text-muted-foreground">지역</div>
                                <Input
                                    placeholder="예: 전국, 수도권"
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                />
                            </div>
                        )}

                        {/* 대상 */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <div className="text-sm text-muted-foreground pt-2">대상</div>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant={targetType === 'nationwide' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTargetType('nationwide')}
                                    >
                                        전국
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={targetType === 'regional' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTargetType('regional')}
                                    >
                                        지역
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={targetType === 'school_type' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTargetType('school_type')}
                                    >
                                        학교 종류
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={targetType === 'specific' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTargetType('specific')}
                                    >
                                        기타
                                    </Button>
                                </div>

                                {/* 학교 종류 선택 */}
                                {targetType === 'school_type' && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {SCHOOL_TYPES.map(st => (
                                            <Button
                                                key={st}
                                                type="button"
                                                variant={selectedSchoolTypes.includes(st) ? 'default' : 'outline'}
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => toggleSchoolType(st)}
                                            >
                                                {st}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {/* 기타 - 직접 학교 지명 */}
                                {targetType === 'specific' && (
                                    <Input
                                        className="mt-2"
                                        placeholder="학교명 직접 입력 (예: 서울과학고, 대전과학고)"
                                        value={specificSchools}
                                        onChange={(e) => setSpecificSchools(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* 기타 사항 */}
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <div className="text-sm text-muted-foreground pt-2">기타</div>
                            <Textarea
                                className="min-h-[60px] resize-none"
                                placeholder="추가로 안내할 사항"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    <Button variant="default" onClick={handleSubmit}>저장</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
