"use client";

import { useEffect, useRef, useState } from "react";
import { isAwaitingCredits, AwaitingCreditsError, navigateToAwaitingCredits } from "@/lib/awaitingCredits";
import { useLocale } from "next-intl";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import ReferenceImageUpload from "@/app/[locale]/_components/ReferenceImageUpload";
import { factoryExportService, IMAGE_TO_PSD_CREDITS, USD_PER_CREDIT } from "@/services/factoryExport";

export default function ImageToPsdForm() {
  const zh = useLocale() === "zh";
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [colors, setColors] = useState(24);
  const [project, setProject] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const submitting = useRef(false);
  const price = `$${(IMAGE_TO_PSD_CREDITS * USD_PER_CREDIT).toFixed(2)} · ${IMAGE_TO_PSD_CREDITS} credits`;

  // Recover an existing job on reload. Opening the page never creates a job.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("project");
    if (id) setProject(id);
  }, []);

  useEffect(() => {
    if (!project || !user) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    setBusy(true);
    setError(null);
    const poll = async () => {
      attempts += 1;
      try {
        const status = await factoryExportService.getProjectStatus(project);
        if (cancelled) return;
        if (isAwaitingCredits(status)) {
          setBusy(false);
          navigateToAwaitingCredits(new AwaitingCreditsError(project));
          return;
        }
        if (status.status === "COMPLETED" && status.result_url) {
          setUrl(status.result_url);
          setBusy(false);
          return;
        }
        if (status.status === "FAILED") {
          setError(status.failure_reason || (zh ? "导出失败，未扣费。" : "Export failed. No credits charged."));
          setBusy(false);
          setProject(null);
          const next = new URL(window.location.href);
          next.searchParams.delete("project");
          window.history.replaceState(null, "", next);
          return;
        }
      } catch { /* Retry transient polling or signing errors without resubmitting. */ }
      if (cancelled) return;
      if (attempts >= 75) {
        setBusy(false);
        setError(zh ? "暂未取得结果，任务可能仍在运行。请继续查询，不会重复提交。" : "The job may still be running. Check again without submitting another export.");
        return;
      }
      timer = setTimeout(poll, 4000);
    };
    void poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [project, user, retry, zh]);

  async function run() {
    if (!user) { setDrawer("signin"); return; }
    if (!image || submitting.current || busy || project) return;
    submitting.current = true;
    setBusy(true); setError(null); setUrl(null);
    try {
      const result = await factoryExportService.imageToPsd({ image_url: image, colors });
      if (!result.success || !result.project_id) throw new Error(result.message || (zh ? "无法启动导出。" : "Could not start export."));
      const next = new URL(window.location.href);
      next.searchParams.set("project", result.project_id);
      window.history.replaceState(null, "", next);
      setProject(result.project_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : (zh ? "无法启动导出。" : "Could not start export."));
      setBusy(false);
    } finally { submitting.current = false; }
  }

  return <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap justify-between gap-3">
      <h2 className="text-xl font-bold text-neutral-900">{zh ? "导出分层 PSD" : "Export a layered PSD"}</h2>
      <p className="font-semibold text-purple-800">{price}</p>
    </div>
    <p className="mt-2 text-sm text-neutral-600">{zh ? "仅成功后扣费。注册赠送积分不适用。支持扁平插画，不恢复可编辑文字、矢量或物体图层。" : "Charged only on success. Signup credits are excluded. For flat illustrations; does not recover editable text, vectors or object layers."}</p>
    {!project && <fieldset disabled={busy} className="mt-5 space-y-4">
      <ReferenceImageUpload required signInHint="" variant="full" label={zh ? "插画" : "Artwork"}
        hint={zh ? "PNG、JPEG 或 WebP；≤400 万像素，单边≤4096。" : "PNG, JPEG or WebP; up to 4 MP, 4096 px per side."}
        replaceLabel={zh ? "替换" : "Replace"} signInLabel={zh ? "登录后上传" : "Sign in to upload"}
        onChange={setImage} onUploadingChange={setUploading} />
      <label className="block text-sm text-neutral-700">{zh ? "底色数量" : "Base colors"}
        <select value={colors} onChange={e => setColors(Number(e.target.value))} className="ml-3 rounded-lg border p-2">
          {[8, 16, 24, 32].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <button type="button" disabled={!image || uploading || busy} onClick={() => void run()}
        className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white disabled:opacity-40">
        {zh ? "生成分层文件" : "Create layered files"} · {price}
      </button>
    </fieldset>}
    {project && !user && <button type="button" onClick={() => setDrawer("signin")} className="mt-4 underline">{zh ? "登录查看结果" : "Sign in to view result"}</button>}
    <div aria-live="polite">
      {busy && <p className="mt-4 text-sm">{zh ? "正在拆分图层并检查还原质量…" : "Separating layers and checking reconstruction…"}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    </div>
    {project && !busy && !url && user && <button type="button" onClick={() => setRetry(n => n + 1)} className="mt-3 underline">{zh ? "继续查询" : "Check again"}</button>}
    {url && <div className="mt-5 space-y-3">
      <a href={url} className="inline-block rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white">{zh ? "下载 PSD 和图层 ZIP" : "Download PSD + layers ZIP"}</a>
      <p className="text-sm text-neutral-600">{zh ? "改色时建议隐藏 Residue 图层，避免原始细节覆盖新颜色。" : "Hide Residue while recoloring so original detail does not cover your color edits."}</p>
      <button type="button" className="block text-sm underline" onClick={() => {
        setProject(null); setUrl(null); setError(null); setImage(null);
        const next = new URL(window.location.href); next.searchParams.delete("project"); window.history.replaceState(null, "", next);
      }}>{zh ? "处理另一张图片" : "Export another image"}</button>
    </div>}
  </section>;
}
