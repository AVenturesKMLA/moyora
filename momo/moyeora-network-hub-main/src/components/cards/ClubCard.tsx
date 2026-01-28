import { Club } from '@/data/demoData';
import { Badge } from '@/components/ui/badge';

interface ClubCardProps {
  club: Club;
  onClick?: () => void;
}

export function ClubCard({ club, onClick }: ClubCardProps) {
  const trustVariant = club.trust >= 85 ? 'trust_high' : club.trust >= 75 ? 'trust_mid' : 'trust_low';

  return (
    <div 
      className="p-3 rounded-xl border border-border card-hover"
      onClick={onClick}
    >
      <div className="flex justify-between gap-2.5">
        <div className="min-w-0">
          <div className="font-bold text-foreground truncate">{club.name}</div>
          <div className="text-xs text-muted-foreground mt-1.5">
            {club.school} · {club.region} · {club.size}명
          </div>
        </div>
        <Badge variant={trustVariant}>신뢰 {club.trust}</Badge>
      </div>
      <div className="flex gap-1.5 flex-wrap mt-2.5">
        {club.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}
