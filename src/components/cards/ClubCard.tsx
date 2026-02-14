import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClubCardData {
    id?: string;
    name: string;
    school?: string;
    size?: number;
    trust?: number;
    trustScore?: number;
    onApply?: () => void;
}

interface ClubCardProps {
    club: ClubCardData;
    onClick?: () => void;
}

export function ClubCard({ club, onClick }: ClubCardProps) {
    const score =
        typeof club.trustScore === 'number'
            ? club.trustScore
            : typeof club.trust === 'number'
                ? club.trust
                : 70;

    return (
        <div
            className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
            onClick={onClick}
        >
            <div className="space-y-2 min-w-0 flex-1 mr-4">
                <div>
                    <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                        {club.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                        {club.school || '소속 학교 미정'}
                    </p>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    {['BM', '창업', '로보틱스'].slice(0, 1 + (club.name.length % 2)).map((tag, i) => (
                        <Badge key={i} variant="outline" className="rounded-full font-normal text-muted-foreground bg-muted/20 border-0 text-[11px] px-2">
                            {tag}
                        </Badge>
                    ))}
                    <Badge variant="outline" className="rounded-full font-normal text-muted-foreground bg-muted/20 border-0 text-[11px] px-2">
                        Member {club.size || 10}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 border-primary/20 bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <span className="text-[10px] font-bold text-primary">신뢰</span>
                    <span className="text-sm font-bold text-primary">{score}</span>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] px-3 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        club.onApply?.();
                    }}
                >
                    가입 신청
                </Button>
            </div>
        </div>
    );
}
