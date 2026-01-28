import { Project } from '@/data/demoData';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div 
      className="p-3 rounded-xl border border-white/10 card-hover"
      onClick={onClick}
    >
      <div className="flex justify-between gap-2.5">
        <div className="min-w-0">
          <div className="font-extrabold truncate">{project.title}</div>
          <div className="text-xs text-muted-foreground mt-1.5">
            참여: {project.members.join(', ')}
          </div>
        </div>
        <Badge variant="success">진행 {project.progress}%</Badge>
      </div>
      <div className="text-xs text-muted-foreground mt-2.5">
        다음 액션: {project.next}
      </div>
    </div>
  );
}
