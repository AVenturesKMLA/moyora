
import { Collab, Club } from '@/data/demoData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CollabModalProps {
    collab: Collab | null;
    club?: Club;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply?: () => void;
    onCreateRoom?: () => void;
    isOwnCollab?: boolean;
    onEdit?: () => void;
    acceptedClubs?: Club[];
    onClubClick?: (clubId: string) => void;
}

function formatDateRange(start: string, end?: string): string {
    if (!start) return '일시 미정';

    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) return '일시 미정';

    if (end) {
        const endDate = new Date(end);
        if (!Number.isNaN(endDate.getTime())) {
            return `${format(startDate, 'yyyy년 M월 d일', { locale: ko })} ~ ${format(endDate, 'M월 d일', { locale: ko })}`;
        }
    }

    return format(startDate, 'yyyy년 M월 d일', { locale: ko });
}

export function CollabModal({ collab, club, open, onOpenChange, onApply, isOwnCollab, onEdit, acceptedClubs = [], onClubClick }: CollabModalProps) {
    if (!collab) return null;

    const lastDateStr = collab.dateEnd || collab.dateStart;
    const lastDate = lastDateStr ? new Date(lastDateStr) : null;
    const isPast = !!lastDate && !Number.isNaN(lastDate.getTime()) && lastDate < new Date();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-extrabold text-foreground text-xl">{collab.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                        <div className="text-muted-foreground">유형</div>
                        <div className="text-foreground">{collab.type}</div>

                        <div className="text-muted-foreground">일시</div>
                        <div className="text-foreground">
                            {formatDateRange(collab.dateStart, collab.dateEnd)}
                            {collab.time && ` · ${collab.time}`}
                        </div>

                        <div className="text-muted-foreground">방법</div>
                        <div className="text-foreground">{collab.method === 'offline' ? '오프라인' : '온라인'}</div>

                        {collab.method === 'offline' && collab.address && (
                            <>
                                <div className="text-muted-foreground">장소</div>
                                <div className="text-foreground">{collab.address}</div>
                            </>
                        )}

                        {collab.method === 'online' && collab.onlineInfo && (
                            <>
                                <div className="text-muted-foreground">접속 정보</div>
                                <div className="text-foreground whitespace-pre-wrap">{collab.onlineInfo}</div>
                            </>
                        )}

                        <div className="text-muted-foreground">지역</div>
                        <div className="text-foreground">{collab.region}</div>

                        <div className="text-muted-foreground">모집 주체</div>
                        <div className="text-foreground">{club ? `${club.name} · ${club.school}` : '-'}</div>

                        <div className="text-muted-foreground">예산</div>
                        <div className="text-foreground">{collab.budget || '협의'}</div>

                        {collab.notes && (
                            <>
                                <div className="text-muted-foreground">기타 사항</div>
                                <div className="text-foreground whitespace-pre-wrap">{collab.notes}</div>
                            </>
                        )}
                    </div>

                    {(collab as any).description && (
                        <div className="mt-4 space-y-2">
                            <div className="text-muted-foreground font-semibold">상세 설명</div>
                            <div className="text-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-xl text-sm">{(collab as any).description}</div>
                        </div>
                    )}

                    {acceptedClubs.length > 0 && (
                        <div className="pt-4 border-t mt-4 space-y-3">
                            <div className="text-sm font-semibold text-foreground">참가 동아리 ({acceptedClubs.length})</div>
                            <div className="flex flex-col gap-2">
                                {acceptedClubs.map(ac => (
                                    <div 
                                        key={ac.id} 
                                        onClick={() => onClubClick?.(ac.id)}
                                        className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-primary">{ac.name}</div>
                                            <div className="text-xs text-muted-foreground">{ac.school}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-border my-4" />

                    <div className="flex justify-end gap-2">
                        {isOwnCollab ? (
                            <Button variant="default" onClick={onEdit}>수정하기</Button>
                        ) : (
                            !isPast && <Button variant="default" onClick={onApply} className="w-full sm:w-auto">신청하기</Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
