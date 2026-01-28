
import { Collab, Club } from '@/data/demoData';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CollabCardProps {
    collab: Collab;
    club?: Club;
    onClick?: () => void;
}

function formatDateRange(start: string, end?: string): string {
    if (!start) return '일시 미정';

    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) return '일시 미정';

    if (end) {
        const endDate = new Date(end);
        if (!isNaN(endDate.getTime())) {
            return `${format(startDate, 'M/d', { locale: ko })}~${format(endDate, 'M/d', { locale: ko })}`;
        }
    }
    return format(startDate, 'M월 d일', { locale: ko });
}

export function CollabCard({ collab, club, onClick }: CollabCardProps) {
    const isPast = new Date(collab.dateEnd || collab.dateStart) < new Date();

    return (
        <div
            className="p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between gap-2.5">
                <div className="min-w-0">
                    <div className="font-bold text-foreground truncate">{collab.title}</div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                        {collab.type} · {collab.region} · {formatDateRange(collab.dateStart, collab.dateEnd)} {club && `· ${club.name}`}
                    </div>
                </div>
                <Badge variant={isPast ? 'secondary' : 'default'}>
                    {isPast ? '종료' : 'OPEN'}
                </Badge>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2.5">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{collab.method === 'offline' ? '오프라인' : '온라인'}</span>
                {collab.time && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{collab.time}</span>}
            </div>
        </div>
    );
}
