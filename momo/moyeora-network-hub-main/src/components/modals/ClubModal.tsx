import { Club } from '@/data/demoData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, User } from 'lucide-react';

interface ClubModalProps {
  club: Club | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropose?: () => void;
}

export function ClubModal({ club, open, onOpenChange, onPropose }: ClubModalProps) {
  if (!club) return null;

  const trustVariant = club.trust >= 85 ? 'trust_high' : club.trust >= 75 ? 'trust_mid' : 'trust_low';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-foreground">{club.name} · {club.school}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-xl">
            {club.description}
          </p>

          <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
            <div className="text-muted-foreground">지역</div>
            <div className="text-foreground">{club.region}</div>
            
            <div className="text-muted-foreground">규모</div>
            <div className="text-foreground">{club.size}명</div>
            
            <div className="text-muted-foreground">분야</div>
            <div className="flex gap-1.5 flex-wrap">
              {club.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
            
            <div className="text-muted-foreground">신뢰</div>
            <div className="flex items-center gap-2">
              <Badge variant={trustVariant}>점수 {club.trust}</Badge>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Contact Info */}
          <div>
            <div className="font-bold text-foreground mb-2">연락처</div>
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-sm">
                <User className="w-4 h-4 text-primary" />
                <span className="text-foreground">{club.leader}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-foreground text-xs">{club.email}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-foreground">{club.phone}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div>
            <div className="font-bold text-foreground mb-2">포트폴리오</div>
            <div className="text-sm text-muted-foreground space-y-1">
              {club.portfolio.map((item, i) => (
                <div key={i}>• {item}</div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          <Button variant="primary" className="w-full" onClick={onPropose}>
            협업 제안 보내기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
