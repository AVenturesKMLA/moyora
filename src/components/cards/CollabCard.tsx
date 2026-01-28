
import { Collab, Club } from '@/data/demoData';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from "@/lib/utils";

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
    const isOpen = !isPast;

    return (
        <div
            className="flex flex-col justify-between p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full"
            onClick={onClick}
        >
            <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                        <div className="font-bold text-lg leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                            {collab.title}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                            {collab.type} · {collab.region} · {formatDateRange(collab.dateStart, collab.dateEnd)}
                            {club && <span className="text-foreground/80 font-medium"> · {club.name}</span>}
                        </div>
                    </div>
                    <Badge
                        variant={isOpen ? "secondary" : "secondary"}
                        className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold shrink-0",
                            isOpen ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400" : "opacity-50"
                        )}
                    >
                        {isOpen ? 'OPEN' : '종료'}
                    </Badge>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="rounded-full font-normal text-muted-foreground bg-muted/20 border-0">
                        {collab.method === 'offline' ? '오프라인' : '온라인'}
                    </Badge>
                    {collab.time && (
                        <Badge variant="outline" className="rounded-full font-normal text-muted-foreground bg-muted/20 border-0">
                            {collab.time}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
