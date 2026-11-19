'use client';
import { useEffect, useRef } from 'react';
import { useClientSearchParams } from '@/lib/useClientSearchParams';
import { taskForLocation, taskLang } from '@/lib/creation-tasks';
import { trackTaskStage } from '@/services/taskTracking';
export default function TaskEntryContext({ slug, locale }: { slug: string; locale: string }) {
  const q = useClientSearchParams(); const seen = useRef('');
  const task = q ? taskForLocation(`/tools/${slug}`, q.toString()) : undefined;
  useEffect(() => { if (task && seen.current !== task.id) { seen.current = task.id; trackTaskStage('arrive'); } }, [task]);
  if (!task) return null;
  const ix = taskLang(locale) === 'zh' ? 1 : 0;
  return <div data-task-context={task.id} className="mx-auto mb-5 max-w-3xl rounded-xl bg-purple-50 p-4 text-left"><p className="font-semibold text-purple-900">{task.title[ix]}</p><p className="mt-1 text-sm text-purple-800">{ix ? '已带入所选任务。上传你自己的素材，确认设置后再开始制作。' : 'Your task is selected. Upload your material and check the settings before generating.'}</p></div>;
}
