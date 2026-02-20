// app/[locale]/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Curify Studio",
  description:
    "Read Curify Studio's privacy policy, including data handling, retention, third-party services, and user rights.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-5xl mx-auto p-20 text-gray-800 text-base sm:text-lg leading-relaxed">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">🔐 Privacy Policy</h1>
      <p className="mb-6">Effective Date: September 13, 2025</p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">1. User-Uploaded Content</h2>
      <p className="mb-6">
        You retain full ownership of any videos, audio, transcripts, manga scans, or other content you upload to Curify Studio. By using our services, you grant us a limited, revocable license to process this content solely for the purpose of delivering our services. We do not use your content for model training or resale.
      </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">2. Voice Cloning Consent</h2>
        <p className="mb-6">
          Voice cloning features require explicit, documented consent from the individual whose voice is being cloned. You are responsible for ensuring that proper consent has been obtained before uploading such content. Unauthorized use of someone's voice or likeness is strictly prohibited.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">3. Biometric Data</h2>
        <p className="mb-6">
          If our services process voice data that may be interpreted as biometric data (e.g., speaker recognition or cloning), we comply with applicable laws such as BIPA and GDPR Article 9. We do not use such data for identification and offer deletion upon request.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">4. Data Retention</h2>
        <p className="mb-6">
          Uploaded content and generated outputs are retained for up to 30 days to support editing and reprocessing. You may request permanent deletion at any time through your account settings or by contacting us.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">5. Third-Party Services</h2>
        <p className="mb-6">
          We use external services such as OpenAI, Microsoft Azure, and Hugging Face to process user content. These providers may store or handle data in jurisdictions outside your own. We choose vendors that maintain strong security and privacy standards.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">6. Children's Privacy</h2>
        <p className="mb-6">
          Curify Studio is not intended for children under 13 (U.S.) or 16 (EU). We do not knowingly collect personal data from children without parental consent.
        </p>

        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">7. Usage Logging</h2>
        <p className="mb-6">
          We may log metadata such as IP address, upload timestamps, and feature usage to detect abuse and ensure system integrity. These logs are not shared with third parties except as required by law and are deleted periodically.
        </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">8. Community-Contributed Content</h2>
      <p className="mb-6">
        We do not verify the legality or quality of user-uploaded content (e.g., manga scans, subtitle files, reference audio). Users are responsible for ensuring they have the rights to upload and process any materials submitted through Curify Studio.
      </p>
    </div>
  );
}
