import { useState, useCallback } from 'react';
import { DemoState, loadState, saveState, resetState, Collab, Project, Application, Club, ClubJoinRequest } from '@/data/demoData';

export function useDemo() {
  const [state, setState] = useState<DemoState>(loadState);

  const reset = useCallback(() => {
    const newState = resetState();
    setState(newState);
  }, []);

  const addCollab = useCallback((collab: Omit<Collab, 'id'>) => {
    setState(prev => {
      const id = 'p' + Math.floor(Math.random() * 1e7).toString(16);
      const newState = {
        ...prev,
        collabs: [{ ...collab, id }, ...prev.collabs]
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateCollab = useCallback((collabId: string, updates: Partial<Collab>) => {
    setState(prev => {
      const newState = {
        ...prev,
        collabs: prev.collabs.map(c => 
          c.id === collabId ? { ...c, ...updates } : c
        )
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    setState(prev => {
      const id = 'r' + Math.floor(Math.random() * 1e7).toString(16);
      const newState = {
        ...prev,
        projects: [{ ...project, id }, ...prev.projects]
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addArtifact = useCallback((projectId: string, artifact: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        projects: prev.projects.map(p => 
          p.id === projectId 
            ? { 
                ...p, 
                artifacts: [artifact, ...p.artifacts],
                progress: Math.min(100, p.progress + 7)
              }
            : p
        )
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addApplication = useCallback((application: Omit<Application, 'id'>) => {
    setState(prev => {
      const id = 'app' + Math.floor(Math.random() * 1e7).toString(16);
      const newState = {
        ...prev,
        applications: [{ ...application, id }, ...prev.applications]
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addRating = useCallback((collab_id: string, rated_club_id: string, rating: number) => {
    setState(prev => {
      // Add rating
      const newRatings = [
        ...prev.ratings,
        { collab_id, rated_club_id, rating, rated_at: new Date().toISOString() }
      ];
      
      // Update club trust based on average rating
      const clubRatings = newRatings.filter(r => r.rated_club_id === rated_club_id);
      const avgRating = clubRatings.reduce((sum, r) => sum + r.rating, 0) / clubRatings.length;
      const newTrust = Math.round(avgRating * 20); // Convert 1-5 to roughly 20-100
      
      const newState = {
        ...prev,
        ratings: newRatings,
        clubs: prev.clubs.map(c => 
          c.id === rated_club_id 
            ? { ...c, trust: Math.round((c.trust + newTrust) / 2) } // Average with existing trust
            : c
        )
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateClub = useCallback((clubId: string, updates: Partial<Club>) => {
    setState(prev => {
      const newState = {
        ...prev,
        clubs: prev.clubs.map(c => 
          c.id === clubId ? { ...c, ...updates } : c
        )
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addClubJoinRequest = useCallback((request: Omit<ClubJoinRequest, 'id'>) => {
    setState(prev => {
      const id = 'jreq' + Math.floor(Math.random() * 1e7).toString(16);
      const requests = prev.clubJoinRequests || [];
      const newState = {
        ...prev,
        clubJoinRequests: [{ ...request, id }, ...requests]
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateClubJoinRequest = useCallback((requestId: string, status: 'accepted' | 'rejected') => {
    setState(prev => {
      const requests = prev.clubJoinRequests || [];
      const newState = {
        ...prev,
        clubJoinRequests: requests.map(r => 
          r.id === requestId ? { ...r, status } : r
        )
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const getClub = useCallback((id: string) => {
    return state.clubs.find(c => c.id === id);
  }, [state.clubs]);

  const getCollab = useCallback((id: string) => {
    return state.collabs.find(c => c.id === id);
  }, [state.collabs]);

  const getProject = useCallback((id: string) => {
    return state.projects.find(p => p.id === id);
  }, [state.projects]);

  const getTemplate = useCallback((id: string) => {
    return state.templates.find(t => t.id === id);
  }, [state.templates]);

  return {
    state,
    reset,
    addCollab,
    updateCollab,
    addProject,
    addArtifact,
    addApplication,
    addRating,
    updateClub,
    addClubJoinRequest,
    updateClubJoinRequest,
    getClub,
    getCollab,
    getProject,
    getTemplate,
  };
}
