import { useAtom } from 'jotai';
import { projectsAtom } from '@/app/atoms/atoms';
import { projectService } from '@/services/projects';

export function useProjects() {
  const [projects, setProjects] = useAtom(projectsAtom);

  const fetchProjects = async () => {
    const userProjects = await projectService.getUserProjects();
    setProjects(userProjects);
  };

  const createProject = async (data: TranslateRequest) => {
    const newProject = await projectService.translateVideo(data);
    await fetchProjects(); // Refresh list
    return newProject;
  };

  return {
    projects,
    fetchProjects,
    createProject,
  };
}