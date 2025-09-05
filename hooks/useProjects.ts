import { useAtom } from 'jotai';
import { 
  projectsAtom, 
  currentProjectAtom, 
  projectsLoadingAtom,
  projectsComputedAtom,
  completedProjectsAtom,
  processingProjectsAtom
} from '@/app/atoms/atoms';
import { projectService } from '@/services/projects';
import { Project, CreateProjectRequest, JobSettings } from '@/types/projects';

export function useProjects() {
  const [projects, setProjects] = useAtom(projectsAtom);
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
  const [loading, setLoading] = useAtom(projectsLoadingAtom);
  const [computedData] = useAtom(projectsComputedAtom);
  const [completedProjects] = useAtom(completedProjectsAtom);
  const [processingProjects] = useAtom(processingProjectsAtom);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const userProjects = await projectService.getUserProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: CreateProjectRequest) => {
    setLoading(true);
    try {
      const newProject = await projectService.createProject(data);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProject = async (projectId: string) => {
    try {
      const project = await projectService.getProject(projectId);
      setCurrentProject(project);
      return project;
    } catch (error) {
      console.error('Failed to get project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.project_id !== projectId));
      
      if (currentProject?.project_id === projectId) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  const downloadVideo = async (projectId: string, withWatermark = false) => {
    try {
      const project = projects.find(p => p.project_id === projectId);
      if (!project) throw new Error('Project not found');

      const url = withWatermark 
        ? project.final_video_signed_url_withwatermark 
        : project.final_video_signed_url;
      
      if (!url) throw new Error('Video URL not available');

      // Use signed URL directly for download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.project_name || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download video:', error);
      throw error;
    }
  };

  const reprocessProject = async (projectId: string, newSettings: Partial<JobSettings>) => {
    try {
      const updatedProject = await projectService.reprocessProject(projectId, newSettings);
      setProjects(prev => prev.map(p => 
        p.project_id === projectId ? updatedProject : p
      ));
      return updatedProject;
    } catch (error) {
      console.error('Failed to reprocess project:', error);
      throw error;
    }
  };

  return {
    projects,
    currentProject,
    loading,
    computedData,
    completedProjects,
    processingProjects,
    fetchProjects,
    createProject,
    getProject,
    deleteProject,
    downloadVideo,
    reprocessProject,
    setCurrentProject,
  };
}