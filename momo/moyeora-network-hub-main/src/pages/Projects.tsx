import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ProjectModal } from '@/components/modals/ProjectModal';
import { DemoState } from '@/data/demoData';

interface ProjectsProps {
  state: DemoState;
  onAddArtifact: (projectId: string, artifact: string) => void;
}

export function Projects({ state, onAddArtifact }: ProjectsProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = state.projects.find(p => p.id === selectedProjectId) || null;

  return (
    <div className="container py-4 animate-fade-in">
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="font-extrabold">프로젝트 룸</div>
            <div className="text-sm text-muted-foreground mt-1.5">
              역할/일정/산출물/회의록을 한 곳에
            </div>
          </div>
          <Badge variant="success">실행 단계</Badge>
        </div>
        
        <div className="panel-body">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProjectId(project.id)}
              />
            ))}
          </div>

          {state.projects.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              아직 프로젝트가 없습니다. 협업 모집에서 프로젝트 룸을 생성해보세요.
            </div>
          )}
        </div>
      </section>

      <ProjectModal
        project={selectedProject}
        open={!!selectedProjectId}
        onOpenChange={(open) => !open && setSelectedProjectId(null)}
        onAddArtifact={(artifact) => {
          if (selectedProjectId) {
            onAddArtifact(selectedProjectId, artifact);
          }
        }}
      />
    </div>
  );
}
