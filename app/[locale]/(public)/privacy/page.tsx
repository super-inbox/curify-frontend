// app/[locale]/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | curify-ai",
  description:
    "Read the privacy policy for curify-ai (curify-ai.com), including data we collect, how we use and share it, your rights, security practices, and TikTok integration disclosures.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-5xl mx-auto p-20 text-gray-800 text-base sm:text-lg leading-relaxed">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">🔐 Privacy Policy</h1>
      <p className="mb-6">Effective Date: June 26, 2026</p>

      <p className="mb-6">
        This Privacy Policy explains how <strong>curify-ai</strong> — the AI visual content
        platform available at <a href="https://curify-ai.com" className="underline">curify-ai.com</a>,
        operated by Curify Studio — collects, uses, shares, and protects your information.
        Throughout this document, &ldquo;curify-ai&rdquo;, &ldquo;Curify Studio&rdquo;,
        &ldquo;we&rdquo;, &ldquo;our&rdquo;, and &ldquo;the service&rdquo; refer to the same
        product. By accessing curify-ai you acknowledge that you have read and understood
        this Privacy Policy.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">1. Information We Collect</h2>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">1.1 Account Information</h3>
      <p className="mb-4">
        When you create an account on curify-ai, we collect information you provide directly,
        including your name, email address, password (stored as a salted hash), and any
        optional profile information such as a profile picture or display name. If you sign
        up using a third-party identity provider (e.g., Google, TikTok), we receive basic
        profile information from that provider as described in Section 6.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">1.2 User-Uploaded Content</h3>
      <p className="mb-4">
        We collect the content you upload to curify-ai for processing, including videos,
        audio recordings, images, transcripts, manga scans, subtitle files, reference photos,
        and text prompts. You retain full ownership of this content. By using our services,
        you grant us a limited, revocable license to process the content solely for the
        purpose of delivering our services to you. We do not use your content for AI model
        training or resell it to third parties.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">1.3 Usage Data and Analytics</h3>
      <p className="mb-4">
        We automatically collect technical and usage data when you interact with curify-ai,
        including: IP address, browser type and version, device type and operating system,
        referring URLs, pages viewed, features used, time spent on pages, search queries
        within the service, click events, upload timestamps, and crash or error reports.
        This data is used to operate, secure, and improve the service.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">1.4 Cookies and Similar Technologies</h3>
      <p className="mb-4">
        We use cookies, local storage, and similar tracking technologies to maintain your
        session, remember your preferences, understand how the service is used, and (where
        applicable) measure the effectiveness of marketing. Categories include: (a) strictly
        necessary cookies for authentication and security; (b) functional cookies for
        preferences (language, theme); (c) analytics cookies (e.g., for aggregated usage
        statistics); and (d) where applicable, advertising or attribution cookies. You can
        control cookies through your browser settings, but disabling strictly necessary
        cookies may prevent core features from working.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">1.5 Payment Information</h3>
      <p className="mb-4">
        If you purchase a paid plan, credits, or other paid features, payment information
        (card number, billing address) is collected and processed by our third-party
        payment processor. We do not store full card numbers on our servers; we retain
        only a transaction reference, the last four digits of the card, and the card brand
        for receipts and customer support.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">1.6 Communications</h3>
      <p className="mb-4">
        If you contact us (via email, support form, or other channels), we retain the
        communication and any information you provide so that we can respond and improve
        our support.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
      <p className="mb-4">We use the information we collect to:</p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li>Provide, operate, and maintain curify-ai and its features;</li>
        <li>Process the content you upload to deliver the AI outputs you request (translations, generated images, dubbed audio, subtitles, mockups, etc.);</li>
        <li>Create and manage your account, authenticate you, and provide customer support;</li>
        <li>Process payments and manage subscriptions or credits;</li>
        <li>Send service-related communications (account notices, security alerts, policy updates);</li>
        <li>Send marketing communications where you have opted in or where permitted by applicable law (you can unsubscribe at any time);</li>
        <li>Monitor, detect, and prevent fraud, abuse, security incidents, and violations of our Terms of Service;</li>
        <li>Analyze usage to understand which features are useful and to improve the service;</li>
        <li>Comply with legal obligations, respond to lawful requests from public authorities, and enforce our agreements.</li>
      </ul>
      <p className="mb-6">
        For users in the European Economic Area, United Kingdom, or Switzerland, our legal
        bases for processing under the GDPR are: (a) <em>performance of a contract</em> with
        you (to deliver the service); (b) <em>legitimate interests</em> (to secure and improve
        the service, prevent fraud); (c) <em>consent</em> (for optional features, marketing,
        or processing of special categories of data); and (d) <em>legal obligation</em>.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">3. How We Share Your Information</h2>
      <p className="mb-4">
        We do not sell your personal information. We share information only in the
        following circumstances:
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">3.1 Service Providers</h3>
      <p className="mb-4">
        We share information with vendors who help us operate curify-ai, including: cloud
        hosting and storage providers (e.g., Microsoft Azure, Google Cloud, Vercel), AI
        and machine-learning processing providers (e.g., OpenAI, Google Gemini, Hugging
        Face), analytics providers, payment processors, email delivery providers, and
        customer-support tools. These providers are contractually obligated to handle your
        information only as necessary to provide their services to us and to maintain
        appropriate security.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">3.2 Legal Compliance and Safety</h3>
      <p className="mb-4">
        We may disclose information when we believe in good faith that disclosure is
        required by law, regulation, legal process, or governmental request; to enforce
        our Terms of Service or other agreements; or to protect the rights, property, or
        safety of curify-ai, our users, or the public.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">3.3 Business Transfers</h3>
      <p className="mb-4">
        If we are involved in a merger, acquisition, financing, reorganization, bankruptcy,
        or sale of assets, your information may be transferred as part of that transaction.
        We will notify you of any such change in ownership or control of your information.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">3.4 With Your Consent</h3>
      <p className="mb-4">
        We may share information with third parties when you direct us to do so — for
        example, when you connect a third-party platform such as TikTok to publish content,
        or when you explicitly opt in to a feature that involves sharing.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">3.5 Aggregated or De-identified Data</h3>
      <p className="mb-4">
        We may share aggregated or de-identified data (which cannot reasonably be used to
        identify you) for analytics, research, or commercial purposes.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">4. AI-Specific Disclosures</h2>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">4.1 AI Processing of Your Content</h3>
      <p className="mb-4">
        curify-ai uses artificial-intelligence models to process the content you upload —
        for example, to translate text, generate or edit images, transcribe audio, dub
        video, or compose mockups. Some processing occurs on our own infrastructure;
        other processing is performed by third-party AI providers (see Section 3.1). When
        we send your content to a third-party AI provider, we do so solely to perform the
        operation you have requested.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">4.2 Voice Cloning Consent</h3>
      <p className="mb-4">
        Voice cloning features require explicit, documented consent from the individual
        whose voice is being cloned. You are responsible for ensuring that proper consent
        has been obtained before uploading such content. Unauthorized use of someone&rsquo;s
        voice or likeness is strictly prohibited and may result in account termination.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">4.3 Biometric Data</h3>
      <p className="mb-4">
        If our services process voice data or facial-image data that may be interpreted
        as biometric data (e.g., speaker recognition, voice cloning, face-based image
        generation), we comply with applicable laws such as the Illinois Biometric
        Information Privacy Act (BIPA), the Texas Capture or Use of Biometric Identifier
        Act, and GDPR Article 9. We do not use such data for identification purposes and
        we offer deletion upon request.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">4.4 Generated Outputs</h3>
      <p className="mb-4">
        You retain rights to outputs generated by our system, provided you have rights
        to the inputs. We may retain generated outputs for the retention period described
        in Section 7 to support editing, reprocessing, and customer support.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">4.5 Model Training</h3>
      <p className="mb-4">
        We do not use your uploaded content or generated outputs to train our own AI
        models or those of our third-party AI providers, unless you explicitly opt in
        to such use.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">5. Community-Contributed Content</h2>
      <p className="mb-4">
        We do not independently verify the legality, accuracy, or quality of user-uploaded
        content (such as manga scans, subtitle files, reference audio, or third-party
        images). You are responsible for ensuring that you have all necessary rights and
        permissions for any materials you submit to curify-ai. Content that infringes
        third-party rights may be removed and the responsible account suspended.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">6. TikTok Integration</h2>
      <p className="mb-4">
        If you choose to connect your TikTok account to curify-ai (for example, to sign in
        with TikTok, to publish generated content to TikTok, or to access TikTok-related
        features), we access and process information through TikTok&rsquo;s official APIs
        in accordance with TikTok&rsquo;s Developer Terms of Service and the scopes you
        approve at the time of authorization.
      </p>
      <p className="mb-4"><strong>Information we receive from TikTok:</strong></p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>Your TikTok user identifier (open_id / union_id)</li>
        <li>Your TikTok display name, username, and avatar URL</li>
        <li>OAuth access and refresh tokens that allow us to act on your behalf within the scopes you authorize</li>
        <li>Where you have authorized publishing scopes, the metadata and status of content you ask us to publish on TikTok</li>
      </ul>
      <p className="mb-4"><strong>How we use TikTok data:</strong></p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>To authenticate you and link your TikTok identity to your curify-ai account</li>
        <li>To publish content to your TikTok account when you explicitly request it</li>
        <li>To display your TikTok profile information within curify-ai (e.g., on your account page)</li>
      </ul>
      <p className="mb-4"><strong>What we do NOT do:</strong></p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>We do not access your TikTok password</li>
        <li>We do not read your TikTok direct messages</li>
        <li>We do not access TikTok data outside the scopes you have explicitly authorized</li>
        <li>We do not sell TikTok-derived data to third parties</li>
        <li>We do not use TikTok data to train AI models</li>
      </ul>
      <p className="mb-4">
        You may revoke curify-ai&rsquo;s access to your TikTok account at any time by
        disconnecting it within your curify-ai account settings or by removing the
        authorization from your TikTok account&rsquo;s connected apps page. When you
        revoke access, we will delete the associated OAuth tokens and any TikTok-derived
        data we hold, except where retention is required to comply with legal obligations
        or to resolve disputes.
      </p>
      <p className="mb-6">
        Your use of TikTok itself is governed by TikTok&rsquo;s own privacy policy,
        available at{" "}
        <a href="https://www.tiktok.com/legal/privacy-policy" className="underline">
          https://www.tiktok.com/legal/privacy-policy
        </a>.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">7. Data Retention</h2>
      <p className="mb-4">
        We retain your information for as long as your account is active and for the
        periods described below:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li><strong>Uploaded content and generated outputs:</strong> retained for up to 30 days to support editing and reprocessing, unless you choose a longer or shorter retention setting where available.</li>
        <li><strong>Account information:</strong> retained for the lifetime of your account; deleted within 30 days of account deletion, except where longer retention is required by law.</li>
        <li><strong>Usage logs:</strong> retained for up to 12 months for security, abuse detection, and analytics, then deleted or aggregated.</li>
        <li><strong>Payment and transaction records:</strong> retained as required by applicable tax, accounting, and anti-fraud laws (typically 7 years).</li>
        <li><strong>Communications:</strong> retained as long as necessary to resolve the matter and for a reasonable period afterward.</li>
      </ul>
      <p className="mb-6">
        You may request earlier deletion of any of the above by contacting us as described
        in Section 13.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">8. Data Security</h2>
      <p className="mb-6">
        We implement technical and organizational measures designed to protect your
        information against unauthorized access, alteration, disclosure, or destruction.
        These include encryption of data in transit (TLS), encryption at rest for sensitive
        data, hashed passwords, role-based access controls, audit logging, vendor security
        reviews, and incident-response procedures. No internet-based service can be
        guaranteed 100% secure; if we become aware of a data breach affecting your
        personal information, we will notify you and the relevant authorities as required
        by applicable law.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">9. Your Rights and Choices</h2>
      <p className="mb-4">
        Depending on where you live, you may have the following rights with respect to
        your personal information:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li><strong>Access</strong> — request a copy of the personal information we hold about you;</li>
        <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete information;</li>
        <li><strong>Deletion</strong> — request that we delete your personal information;</li>
        <li><strong>Portability</strong> — receive a copy of your data in a structured, commonly used format;</li>
        <li><strong>Restriction</strong> — ask us to restrict certain processing;</li>
        <li><strong>Objection</strong> — object to processing based on our legitimate interests, including direct marketing;</li>
        <li><strong>Withdraw consent</strong> — where processing is based on consent, withdraw it at any time;</li>
        <li><strong>Complaint</strong> — lodge a complaint with your local data protection authority.</li>
      </ul>
      <p className="mb-6">
        You can exercise most of these rights directly through your account settings, or
        by contacting us as described in Section 13. We will respond within the timeframes
        required by applicable law (typically 30 days under GDPR; 45 days under CCPA, with
        possible extensions).
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">9.1 California Privacy Rights (CCPA / CPRA)</h3>
      <p className="mb-4">
        If you are a California resident, you have the right to know what personal
        information we collect, the categories of sources and recipients, and the purposes
        for collection; to request deletion or correction; to opt out of the &ldquo;sale&rdquo;
        or &ldquo;sharing&rdquo; of personal information (we do not sell your personal
        information); and to limit the use of sensitive personal information. You will not
        be discriminated against for exercising these rights. You may also designate an
        authorized agent to make a request on your behalf.
      </p>

      <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2">9.2 EEA / UK / Swiss Privacy Rights (GDPR / UK GDPR)</h3>
      <p className="mb-4">
        If you are located in the European Economic Area, United Kingdom, or Switzerland,
        the rights listed above are provided to you under the GDPR (or UK GDPR / Swiss FADP
        equivalent). You also have the right to lodge a complaint with your local supervisory
        authority.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">10. International Data Transfers</h2>
      <p className="mb-6">
        curify-ai is operated from the United States, and our service providers may process
        data in the United States, the European Union, and other countries. When we transfer
        personal information out of the EEA, UK, or Switzerland, we rely on appropriate
        safeguards such as the European Commission&rsquo;s Standard Contractual Clauses or
        equivalent mechanisms. By using curify-ai, you understand that your information may
        be transferred to and processed in countries other than your country of residence,
        which may have different data-protection laws.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">11. Children&rsquo;s Privacy</h2>
      <p className="mb-6">
        curify-ai is not directed to children under the age of 13 (or under 16 in the
        European Economic Area). We do not knowingly collect personal information from
        children without verifiable parental consent. If you believe we have collected
        personal information from a child without appropriate consent, please contact us
        and we will take steps to delete the information.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">12. Changes to This Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy from time to time to reflect changes to our
        practices, our service, or applicable law. When we make material changes, we will
        update the &ldquo;Effective Date&rdquo; at the top of this page and, where
        appropriate, notify you by email or through a notice within the service. Your
        continued use of curify-ai after a change takes effect constitutes your acceptance
        of the updated policy.
      </p>

      <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-3">13. Contact Us</h2>
      <p className="mb-4">
        If you have questions, concerns, or requests regarding this Privacy Policy or our
        handling of your personal information, please contact us at:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-1">
        <li><strong>Contact email:</strong> <a href="mailto:team@curify-ai.com" className="underline">team@curify-ai.com</a></li>
        <li><strong>Website:</strong> <a href="https://curify-ai.com" className="underline">https://curify-ai.com</a></li>
        <li><strong>Operator:</strong> Curify Studio</li>
      </ul>
      <p className="mb-6">
        We will respond to your inquiry within a reasonable timeframe and in any event
        within the periods required by applicable law.
      </p>
    </div>
  );
}
