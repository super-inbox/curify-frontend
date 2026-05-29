import Link from "next/link";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { formatVoiceCloningContent } from "../utils/content-formatters";

interface VoiceCloningToolsContentProps {
  slug: string;
  t: any;
  locale: string;
}

const TOOLS = [
  {
    idx: 1,
    color: "blue",
    image: "/images/voice-cloning-tools-elevenlabs.webp",
    href: "https://elevenlabs.io/",
  },
  {
    idx: 2,
    color: "green",
    image: "/images/voice-cloning-tools-f5-tts.webp",
    href: "https://github.com/SWivid/F5-TTS",
  },
  {
    idx: 3,
    color: "purple",
    image: "/images/voice-cloning-tools-openvoice.webp",
    href: "https://github.com/myshell-ai/OpenVoice",
  },
] as const;

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
};

export default function VoiceCloningToolsContent({ slug, t, locale }: VoiceCloningToolsContentProps) {
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-purple-600 mb-4">
        {t("intro")}
      </p>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whoThisIsForTitle")}</h2>
        <div
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{
            __html: formatVoiceCloningContent(t("whoThisIsForContent"))
          }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("buyersGuideTitle")}</h2>
        <div
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{
            __html: formatVoiceCloningContent(t("buyersGuideContent"))
          }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("methodologyTitle")}</h2>
        <div
          className="prose prose-lg max-w-none mb-4 italic text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-700 pl-4"
          dangerouslySetInnerHTML={{
            __html: formatVoiceCloningContent(t("methodologyContent"))
          }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <p className="mb-6">{t("toolsIntro")}</p>

        {TOOLS.map(({ idx, color, image, href }) => (
          <div
            key={idx}
            className={`${COLOR_CLASSES[color]} border-l-4 rounded-lg my-6 not-prose overflow-hidden`}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
            >
              <CdnImage
                src={image}
                alt={`${t(`tool${idx}Name`).replace(/^\d+\.\s*/, "")} homepage`}
                width={1200}
                height={600}
                className="w-full h-auto max-h-64 object-contain"
              />
            </a>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">
                <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {t(`tool${idx}Name`)}
                </a>
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 italic">
                {t(`tool${idx}Tagline`)}
              </p>
              <ul className="text-sm space-y-1 mb-4">
                <li><strong>Best for:</strong> {t(`tool${idx}BestFor`)}</li>
                <li><strong>Pricing:</strong> {t(`tool${idx}Pricing`)}</li>
                <li><strong>Languages:</strong> {t(`tool${idx}Languages`)}</li>
                <li><strong>Notable limitation:</strong> {t(`tool${idx}Limitation`)}</li>
              </ul>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatVoiceCloningContent(t(`tool${idx}WhenToPick`))
                }}
              />
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("comparisonTitle")}</h2>
        <p className="mb-4">{t("comparisonIntro")}</p>
        <div className="overflow-x-auto my-6 not-prose">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left"></th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">ElevenLabs</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">F5-TTS</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">OpenVoice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Best for</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool1BestFor")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool2BestFor")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool3BestFor")}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Pricing</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool1Pricing")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool2Pricing")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool3Pricing")}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Languages</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool1Languages")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool2Languages")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool3Languages")}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Limitation</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool1Limitation")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool2Limitation")}</td>
                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t("tool3Limitation")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("decisionRubricTitle")}</h2>
        <div
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{
            __html: formatVoiceCloningContent(t("decisionRubricContent"))
          }}
        />
      </section>

      <section id="curify-callout" className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-8 rounded-lg my-8 not-prose">
        <h2 className="text-2xl font-bold mb-4">{t("curifyCalloutTitle")}</h2>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: formatVoiceCloningContent(t("curifyCalloutContent"))
          }}
        />
        <div className="mt-6">
          <Link
            href="/tools/video-dubbing"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Try Curify Video Dubbing →
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("complianceTitle")}</h2>
        <div
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{
            __html: formatVoiceCloningContent(t("complianceContent"))
          }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("faqTitle")}</h2>
        <div className="space-y-6 mb-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <h3 className="text-lg font-semibold mb-2">{t(`faq${idx}Q`)}</h3>
              <div
                className="prose prose-base max-w-none text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: formatVoiceCloningContent(t(`faq${idx}A`))
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{
            __html: formatVoiceCloningContent(t("conclusionContent"))
          }}
        />
      </section>
    </div>
  );
}
