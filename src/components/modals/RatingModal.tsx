
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Club, Collab } from '@/data/demoData';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingModalProps {
    collab: Collab;
    clubs: Club[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmitRatings: (ratings: { clubId: string; rating: number }[]) => void;
}

export function RatingModal({ collab, clubs, open, onOpenChange, onSubmitRatings }: RatingModalProps) {
    const [ratings, setRatings] = useState<Record<string, number>>({});

    const handleRating = (clubId: string, rating: number) => {
        setRatings(prev => ({ ...prev, [clubId]: rating }));
    };

    const handleSubmit = () => {
        const ratingList = Object.entries(ratings).map(([clubId, rating]) => ({ clubId, rating }));
        onSubmitRatings(ratingList);
        setRatings({});
    };

    const isPast = new Date(collab.dateEnd || collab.dateStart) < new Date();

    if (!isPast) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[400px] bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold text-foreground">참가자 평가</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">
                            협업 일시가 지난 후에 참가자를 평가할 수 있습니다.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (clubs.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[400px] bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold text-foreground">참가자 평가</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">
                            아직 수락된 참가자가 없습니다.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="font-extrabold text-foreground">참가자 평가</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        "{collab.title}" 협업에 참여한 동아리를 평가해주세요.
                        이 평가는 동아리의 신뢰값에 반영됩니다.
                    </p>

                    <div className="h-px bg-border" />

                    <div className="space-y-4">
                        {clubs.map(club => (
                            <div key={club.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border">
                                <div>
                                    <div className="font-bold text-foreground">{club.name}</div>
                                    <div className="text-xs text-muted-foreground">{club.school}</div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRating(club.id, star)}
                                            className="p-0.5"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-6 h-6 transition-colors",
                                                    (ratings[club.id] || 0) >= star
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-muted-foreground"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex gap-2">
                        <Button variant="default" onClick={handleSubmit}>평가 제출</Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
