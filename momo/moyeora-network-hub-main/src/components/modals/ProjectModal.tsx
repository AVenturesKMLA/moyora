import { useState } from 'react';
import { Project } from '@/data/demoData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddArtifact?: (artifact: string) => void;
}

export function ProjectModal({ project, open, onOpenChange, onAddArtifact }: ProjectModalProps) {
  const [artifactName, setArtifactName] = useState('');

  if (!project) return null;

  const handleAdd = () => {
    if (artifactName.trim() && onAddArtifact) {
      onAddArtifact(artifactName.trim());
      setArtifactName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-white/[0.06] to-white/[0.03] border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-extrabold">{project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
            <div className="text-muted-foreground">참여</div>
            <div>{project.members.join(', ')}</div>
            
            <div className="text-muted-foreground">진행률</div>
            <div><Badge variant="success">{project.progress}%</Badge></div>
            
            <div className="text-muted-foreground">다음 액션</div>
            <div>{project.next}</div>
          </div>

          <div className="h-px bg-white/[0.08]" />

          <div>
            <div className="font-extrabold mb-2">산출물</div>
            <div className="text-sm text-muted-foreground space-y-1">
              {project.artifacts.map((item, i) => (
                <div key={i}>• {item}</div>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.08]" />

          <div className="flex gap-2">
            <input
              type="text"
              className="glass-input flex-1"
              placeholder="산출물 이름"
              value={artifactName}
              onChange={(e) => setArtifactName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button variant="primary" onClick={handleAdd}>추가</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
