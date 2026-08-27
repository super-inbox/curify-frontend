"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { contactService } from "@/services/contact";

const CALENDLY = "https://calendly.com/qqwjq9916/15-minute-meeting";

// Bounds on what we accept from the URL. `source` is echoed into the team
// notification and stored on the lead, and `subject` is rendered into an
// input, so neither is trusted at arbitrary length — the backend caps
// source at 200 chars and would 422 the whole submission otherwise.
const MAX_SUBJECT = 120;
const MAX_SOURCE = 200;

function clamp(value: string | null, max: number): string {
  return (value ?? "").slice(0, max);
}

function ContactForm() {
  const t = useTranslations("contact");
  const params = useSearchParams();

  // Prefill from the referring surface. The bulk CTAs on template, topic and
  // blog pages link here with ?subject=&source=, so an inbound lead arrives
  // naming the page that motivated it rather than as an anonymous request.
  const prefilledSubject = clamp(params.get("subject"), MAX_SUBJECT);
  const source = clamp(params.get("source"), MAX_SOURCE);

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(prefilledSubject);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      await contactService.sendMail({
        email,
        subject,
        content,
        ...(source ? { source } : {}),
      });
      setStatus("ok");
      setEmail("");
      setSubject("");
      setContent("");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-lg shadow-md flex flex-col flex-1"
    >
      <h2 className="text-lg font-semibold mb-2">📧 {t("form.title")}</h2>
      <p className="text-sm text-gray-600 mb-3">{t("form.description")}</p>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder={t("form.emailPlaceholder")}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        type="text"
        required
        maxLength={MAX_SUBJECT}
        placeholder={t("form.subjectPlaceholder")}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        required
        placeholder={t("form.contentPlaceholder")}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? t("form.sending") : t("form.submit")}
      </button>

      {status !== "idle" && (
        <p
          role="status"
          className={`mt-3 text-center text-sm ${
            status === "ok" ? "text-green-700" : "text-red-600"
          }`}
        >
          {status === "ok" ? t("form.success") : t("form.error")}
        </p>
      )}
    </form>
  );
}

export default function ContactClient() {
  const t = useTranslations("contact");

  return (
    <div className="min-h-screen p-6 py-20 bg-gray-50 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {t("title")}
        </h1>

        {/* Divider */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 mx-auto">
          <span className="flex-1 h-px w-10 bg-gray-300" />
          {t("chooseMethod")}
          <span className="flex-1 h-px w-10 bg-gray-300" />
        </div>

        {/* 2-column layout */}
        <div className="flex flex-col md:flex-row gap-16 w-full">
          {/* useSearchParams needs a Suspense boundary or the whole route
              opts out of static rendering at build time. */}
          <Suspense
            fallback={
              <div className="bg-white p-5 rounded-lg shadow-md flex-1 min-h-[520px]" />
            }
          >
            <ContactForm />
          </Suspense>

          {/* Calendly Embed */}
          <div className="bg-white p-5 rounded-lg shadow-md flex-1 flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">📅 {t("call.title")}</h2>
              <p className="text-sm text-gray-600 mb-3">{t("call.description")}</p>
            </div>

            <iframe
              src={CALENDLY}
              width="100%"
              height="650"
              frameBorder="0"
              className="rounded-lg"
              title={t("call.title")}
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
