import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getKeywordLabel } from '@/data/clubKeywords';

interface ClubCardData {
    id?: string;
    name: string;
    school?: string;
    size?: number;
    description?: string;
    clubTheme?: string;
    keywords?: string[];
    onApply?: () => void;
}

interface ClubCardProps {
    club: ClubCardData;
    onClick?: () => void;
}

export function ClubCard({ club, onClick }: ClubCardProps) {
    const intro =
        typeof club.description === 'string' && club.description.trim()
            ? club.description.trim()
            : `${club.name} · ${club.school || '소속 학교 미정'}`.trim();
    const hoverLabel = intro.length > 160 ? `${intro.slice(0, 157)}…` : intro;

    return (
        <div
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
            onClick={onClick}
            title={hoverLabel}
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
                    {club.clubTheme ? (
                        <Badge variant="outline" className="rounded-full font-normal text-muted-foreground bg-muted/20 border-0 text-[11px] px-2">
                            {club.clubTheme === '체육' ? '운동' : club.clubTheme}
                        </Badge>
                    ) : null}
                    {(club.keywords || []).slice(0, 4).map((kid) => (
                        <Badge
                            key={kid}
                            variant="secondary"
                            className="rounded-full font-normal text-[11px] px-2 border-0 bg-primary/10 text-primary"
                        >
                            {getKeywordLabel(kid)}
                        </Badge>
                    ))}
                    {(club.keywords?.length || 0) > 4 ? (
                        <Badge variant="outline" className="rounded-full text-[11px] px-2 border-0">
                            +{club.keywords!.length - 4}
                        </Badge>
                    ) : null}
                    <Badge variant="outline" className="rounded-full font-normal text-muted-foreground bg-muted/20 border-0 text-[11px] px-2">
                        Member {club.size || 10}
                    </Badge>
                </div>

                <p className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] line-clamp-3 bg-gradient-to-t from-card via-card/95 to-transparent px-5 pb-4 pt-12 text-xs leading-snug text-muted-foreground opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                    {hoverLabel}
                </p>
            </div>

            <div className="relative z-[2] flex shrink-0 items-end self-stretch pb-0.5 sm:items-center sm:self-auto sm:pb-0">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[11px] px-3 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white"
                    onClick={(e: { stopPropagation(): void }) => {
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
