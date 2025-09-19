import { atom } from 'jotai';
import { User } from '@/types/auth';
import { Project, ProjectComputedData } from '@/types/projects';

// Projects atoms
export const projectsAtom = atom<Project[]>([]);
export const currentProjectAtom = atom<Project | null>(null);
export const projectsLoadingAtom = atom(false);

// Computed projects data atom
export const projectsComputedAtom = atom<ProjectComputedData[]>((get) => {
  const projects = get(projectsAtom);
  
  return projects.map(project => {
    const isCompleted = project.status === 'completed';
    const hasVideo = !!project.final_video_signed_url;
    const hasWatermarkedVideo = !!project.final_video_signed_url_withwatermark;
    const hasThumbnail = !!project.thumbnail_signed_url;
    const hasSubtitles = !!project.srt_signed_url;
    const canDownload = isCompleted && hasVideo;

    // Format duration
    const minutes = Math.floor(project.video_duration_seconds / 60);
    const seconds = project.video_duration_seconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Status color mapping
    const statusColors = {
      'completed': '#10B981', // green
      'processing': '#F59E0B', // amber
      'queued': '#6B7280', // gray
      'pending': '#6B7280', // gray
      'failed': '#EF4444', // red
    };
    const statusColor = statusColors[project.status] || '#6B7280';

    return {
      isCompleted,
      hasVideo,
      hasWatermarkedVideo,
      hasThumbnail,
      hasSubtitles,
      durationFormatted,
      statusColor,
      canDownload,
    };
  });
});

// Derived atoms
export const completedProjectsAtom = atom((get) => 
  get(projectsAtom).filter(p => p.status === 'completed')
);

export const processingProjectsAtom = atom((get) => 
  get(projectsAtom).filter(p => ['processing', 'queued', 'pending'].includes(p.status))
);
// UI state atoms
export const authLoadingAtom = atom(false);
export const userAtom = atom<User | null>(null);
export const modalOpenAtom = atom(false);

export type DrawerType = "signin" | "signup" | "emailout" | "emailin" | null;
export const drawerAtom = atom<string | null>(null);

export type ModalType = "add" | "setting" | "charge" | "topup" | null;
export const modalAtom = atom<ModalType>(null);

export type HeaderType = "out" | "in" | string;
export const headerAtom = atom<HeaderType>("out");

export type FooterType = "out" | "in";
export const footerAtom = atom<FooterType>("out");

export const jobTypeAtom = atom<'translation' | 'subtitles' | 'reprocessing'>('translation');
