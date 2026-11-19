'use client';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import { CREATION_TASKS, taskHref, taskLang } from '@/lib/creation-tasks';
import { useTracking } from '@/services/useTracking';
export default function HomeCreationTasks() {
  const lang = taskLang(useLocale()); const zh = lang === 'zh'; const ix = zh ? 1 : 0;
  const { trackAction } = useTracking();
  return <section id="create-tasks" className="my-10 scroll-mt-24" aria-labelledby="create-tasks-title">
    <h2 id="create-tasks-title" className="text-3xl font-bold tracking-tight">{zh ? '用你的素材创作' : 'Make it your own'}</h2>
    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{CREATION_TASKS.map(task => <article key={task.id} data-creation-task={task.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:border-purple-300 hover:shadow-lg focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 motion-safe:hover:-translate-y-1 motion-reduce:transition-none">
      <Link locale={lang} href={taskHref(task.id)} onClick={() => trackAction({ contentId: `home-task:${task.id}:${task.example}`, contentType: 'tool_card' }, 'click')} className="group block h-full cursor-pointer focus-visible:outline-none">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          {task.id === 'asl' && <CdnImage src={task.image} alt="" aria-hidden fill sizes="(min-width: 1280px) 17vw, (min-width: 640px) 33vw, 50vw" className="scale-110 object-cover opacity-50 blur-xl" />}
          <CdnImage src={task.image} alt={task.caption[ix]} fill sizes="(min-width: 1280px) 17vw, (min-width: 640px) 33vw, 50vw" className={task.id === 'asl' ? 'object-contain' : 'object-cover object-center'} />
        </div>
        <div className="p-3"><h3 className="text-base font-bold leading-snug group-hover:text-purple-700">{task.title[ix]}</h3><p className="mt-2 text-sm leading-5 text-neutral-600">{task.description[ix]}</p></div>
      </Link>
    </article>)}</div>

  </section>;
}
