import Head from "next/head";

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us | Curify Studio</title>
      </Head>

      <div className="h-full p-6 py-18 bg-gray-50 absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center overflow-auto">
        <div className="max-w-6xl w-full flex flex-col h-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Contact the Curify Team
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 mx-auto">
            <span className="flex-1 h-px w-10 bg-gray-300" />
            choose a method
            <span className="flex-1 h-px w-10 bg-gray-300" />
          </div>

          {/* 2-column layout: Email Form and Calendly */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Email Form */}
            <form
              action="/api/send-email"
              method="POST"
              className="bg-white p-6 rounded shadow flex flex-col flex-1"
            >
              <h2 className="text-lg font-semibold mb-4">📧 Submit a Request</h2>

              <input
                name="email"
                type="email"
                required
                placeholder="Your email address"
                className="w-full border rounded px-3 py-2 mb-3"
              />

              <input
                name="subject"
                type="text"
                required
                placeholder="Subject (e.g. Trial Request, Feedback, Support, Bug Report)"
                className="w-full border rounded px-3 py-2 mb-3"
              />

              <textarea
                name="text"
                rows={3}
                required
                placeholder={`Please describe your request in detail. Examples:

1. Trial Access:
Let us know what you'd like to try, such as video dubbing, lip syncing, or subtitle removal. Include your video type, duration, and goals.

2. Account/Payment Issue:
Describe the issue you encountered, like credits not updating, failed uploads, or errors.

We'll respond to your request within 2 business days.`}
                className="w-full border rounded px-3 py-2 mb-3 flex-1"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Send Message
              </button>
            </form>

            {/* Calendly Embed */}
            <div className="bg-white p-6 rounded shadow flex-1">
              <h2 className="text-lg font-semibold mb-4">📅 Schedule a Call</h2>
              <iframe
                src="https://calendly.com/qqwjq9916/15-minute-meeting"
                width="100%"
                height="600"
                frameBorder="0"
                className="rounded"
                title="Schedule a call with Curify"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
