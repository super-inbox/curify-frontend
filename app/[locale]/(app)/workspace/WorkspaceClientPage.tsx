"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { modalAtom, jobTypeAtom, userAtom, drawerAtom, clientMountedAtom } from "@/app/atoms/atoms";
import CreateNewModal from "../..//(public)/tools/CreateNewModal";
import { Project } from "@/types/projects";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import DeleteConfirmationDialog from "../../_componentForPage/DeleteConfirmationDialog";
import { formatDuration } from "@/lib/format_utils";
import { projectService } from "@/services/projects";
import { authService } from "@/services/auth";
import GalleryGrid from "../../_componentForPage/GalleryGrid";
import { toSlug } from "@/lib/nano_utils";
import nanoImages from "@/public/data/nano_inspiration.json";

type Tab = "generated" | "saved" | "copied";

type ResolvedCard = {
  id: string;
  image_url: string;
  preview_image_url: string;
  title: string;
  slug: string;
  locale: string;
};

function resolveIds(ids: string[], locale: string): ResolvedCard[] {
  const imageMap = new Map((nanoImages as any[]).map((r) => [r.id, r]));
  return ids
    .map((id) => {
      const r = imageMap.get(id);
      if (!r) return null;
      const loc = r.locales?.[locale] ?? r.locales?.en ?? r.locales?.zh ?? {};
      return {
        id: r.id,
        image_url: r.asset.image_url,
        preview_image_url: r.asset.preview_image_url,
        title: loc.title || loc.category || id,
        slug: toSlug(r.template_id),
        locale,
      };
    })
    .filter(Boolean) as ResolvedCard[];
}

function ImageCard({ card, locale }: { card: ResolvedCard; locale: string }) {
  return (
    <Link
      href={`/${locale}/nano-template/${card.slug}/example/${encodeURIComponent(card.id)}`}
      className="group block overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition"
    >
      <div className="relative aspect-square bg-neutral-100">
        <Image
          src={card.preview_image_url || card.image_url}
          alt={card.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-xs font-medium text-neutral-700">{card.title}</p>
      </div>
    </Link>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center text-neutral-400">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default function WorkspaceClient({ locale }: { locale: string }) {
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [, setModalState] = useAtom(modalAtom);
  const [, setJobType] = useAtom(jobTypeAtom);
  const [clientMounted] = useAtom(clientMountedAtom);

  const [tab, setTab] = useState<Tab>("generated");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const router = useRouter();

  const savedCards = resolveIds(user && "saved_ids" in user ? (user as any).saved_ids ?? [] : [], locale);
  const copiedCards = resolveIds(user && "copied_ids" in user ? (user as any).copied_ids ?? [] : [], locale);

  const refreshProjects = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const profile = await authService.getProfile();
      if (Array.isArray(profile?.projects)) {
        setProjects(profile.projects);
      } else {
        setProjects([]);
      }
    } catch {
      setProjects([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (clientMounted && user) {
      refreshProjects();
    }
  }, [clientMounted, user, refreshProjects]);

  if (!clientMounted) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-neutral-100 aspect-square" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-28 py-10">
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="text-5xl">🗂️</div>
          <h2 className="text-2xl font-bold text-neutral-900">Sign in to access your workspace</h2>
          <p className="text-neutral-500 max-w-md">
            Your saved templates, copied prompts, and generated images — all in one place.
          </p>
          <button
            onClick={() => setDrawerState("signin")}
            className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] text-white font-semibold hover:opacity-90 transition shadow-lg"
          >
            Sign in
          </button>
        </div>
        <h2 className="text-2xl font-bold mt-4 mb-4">Gallery</h2>
        <GalleryGrid />
      </div>
    );
  }

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "generated", label: "Generated", count: projects.length || undefined },
    { id: "saved", label: "Saved", count: savedCards.length || undefined },
    { id: "copied", label: "Copied", count: copiedCards.length || undefined },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
      <h2 className="text-2xl font-bold mb-6">My Workspace</h2>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              tab === t.id
                ? "border-b-2 border-purple-600 text-purple-700"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Generated Tab */}
      {tab === "generated" && (
        <>
          {isRefreshing && (
            <div className="mb-4 inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
              🔄 Refreshing...
            </div>
          )}
          {!isRefreshing && projects.length === 0 && (
            <EmptyState icon="📂" text="No generated projects yet. Create your first to get started." />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {projects.map((project) => {
              const duration = formatDuration(project.video_duration_seconds);
              const createdAt = format(new Date(project.created_at), "yyyy/MM/dd hh:mm a");
              return (
                <div
                  key={project.project_id}
                  onClick={() => {
                    if (openMenuId) return;
                    if (project.status === "COMPLETED") {
                      router.push(`/project_details/${project.project_id}`);
                    } else {
                      router.push(`/magic/${project.project_id}`);
                    }
                  }}
                  className="relative border border-gray-200 rounded-xl overflow-visible shadow-sm bg-white cursor-pointer hover:shadow-md transition"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    <Image
                      src={project.thumbnail_signed_url || "/mock-thumbnail.jpg"}
                      alt={project.project_name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
                      {project.job_settings.target_language?.toUpperCase() ?? ""} · {formatStatus(project.status)}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
                      {duration}
                    </div>
                  </div>
                  <div className="p-3 relative z-10">
                    <p className="font-semibold text-[15px] truncate">{project.project_name}</p>
                    <p className="text-sm text-gray-500">{createdAt}</p>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === project.project_id ? null : project.project_id);
                      }}
                      className="absolute bottom-2 right-2 z-50"
                    >
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400 hover:text-gray-700 cursor-pointer" />
                      {openMenuId === project.project_id && (
                        <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-[9999] text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project);
                              setIsDeleteDialogOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                            type="button"
                          >
                            Delete project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Saved Tab */}
      {tab === "saved" && (
        <>
          {savedCards.length === 0 ? (
            <EmptyState icon="🔖" text="No saved items yet. Browse templates and tap Save to collect ones you like." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {savedCards.map((card) => (
                <ImageCard key={card.id} card={card} locale={locale} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Copied Tab */}
      {tab === "copied" && (
        <>
          {copiedCards.length === 0 ? (
            <EmptyState icon="📋" text="No copied prompts yet. Copy prompts from templates to see them here." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {copiedCards.map((card) => (
                <ImageCard key={card.id} card={card} locale={locale} />
              ))}
            </div>
          )}
        </>
      )}

      <CreateNewModal />

      {projectToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setProjectToDelete(null);
          }}
          projectId={projectToDelete.project_id}
        />
      )}
    </div>
  );
}

function formatStatus(status: string): string {
  return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
