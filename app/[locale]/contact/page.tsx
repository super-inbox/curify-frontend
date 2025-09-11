"use client";

import Head from "next/head";
import { useState } from "react";
import { contactService } from "@/services/contact";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await contactService.sendMail({ email, subject, content });
      setMessage(res); // "Mail sent successfully"
      setEmail("");
      setSubject("");
      setContent("");
    } catch (err) {
      setMessage("❌ Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | Curify Studio</title>
      </Head>

      <div className="min-h-screen p-6 py-20 bg-gray-50 flex flex-col items-center">
        <div className="max-w-4xl w-full flex flex-col">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Contact the Curify Team
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 mx-auto">
            <span className="flex-1 h-px w-10 bg-gray-300" />
            choose a method
            <span className="flex-1 h-px w-10 bg-gray-300" />
          </div>

          {/* 2-column layout */}
          <div className="flex flex-col md:flex-row gap-16 w-full">
            {/* Email Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white p-5 rounded-lg shadow-md flex flex-col flex-1"
            >
              <h2 className="text-lg font-semibold mb-2">📧 Submit a Request</h2>
              <p className="text-sm text-gray-600 mb-3">
                Use this form for general inquiries, technical support, or
                product feedback. Be sure to include relevant details so we can
                assist you faster.
              </p>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Your email address"
                className="w-full border rounded px-3 py-2 mb-3"
              />

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                type="text"
                required
                placeholder="Subject (e.g. Trial Request, Bug Report)"
                className="w-full border rounded px-3 py-2 mb-3"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
                placeholder="Please describe your request in detail..."
                className="w-full border rounded px-3 py-2 mb-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              {message && (
                <p className="mt-3 text-center text-sm text-gray-700">
                  {message}
                </p>
              )}
            </form>

            {/* Calendly Embed */}
            <div className="bg-white p-5 rounded-lg shadow-md flex-1 flex flex-col">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">📅 Schedule a Call</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Ideal for partnership, sales, or technical discussions. Book a
                  15-minute meeting at your convenience—we'll come prepared.
                </p>
              </div>

              <iframe
                src="https://calendly.com/qqwjq9916/15-minute-meeting"
                width="100%"
                height="650"
                frameBorder="0"
                className="rounded-lg"
                title="Schedule a call with Curify"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
