interface UGCVideoTranslationContentProps {
  hasKey: (key: string) => boolean;
  safeT: (key: string, defaultValue?: string) => string;
  formatContent: (content: string) => string;
  getVideoDubbingUrl: (locale: string) => string;
  locale: string;
}

export default function UGCVideoTranslationContent({ 
  hasKey, 
  safeT, 
  formatContent, 
  getVideoDubbingUrl, 
  locale 
}: UGCVideoTranslationContentProps) {
  return (
    <div className="space-y-8">
      {/* Article Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
        {hasKey("date") && (
          <span className="flex items-center">
            <span className="mr-2">📅</span>
            {safeT("date")}
          </span>
        )}
        {hasKey("readTime") && (
          <span className="flex items-center">
            <span className="mr-2">⏱️</span>
            {safeT("readTime")}
          </span>
        )}
        {hasKey("tag") && (
          <span className="flex items-center">
            <span className="mr-2">🏷️</span>
            {safeT("tag")}
          </span>
        )}
      </div>

      {/* Introduction */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {hasKey("title") ? safeT("title") : "UGC Video Translation: Scaling TikToks and Shorts for Global Markets"}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          {hasKey("intro") ? safeT("intro") : "While excellent content exists for translating long-form YouTube videos, the current creator economy is heavily driven by short-form User Generated Content (UGC). Brands and creators are desperate to push their top-performing Shorts and Reels into Spanish, Japanese, and Portuguese markets without losing the energetic pacing of the original creator."}
        </p>
      </section>

      {/* What is UGC Video Translation */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🎯</span>
          {hasKey("whatIsTitle") ? safeT("whatIsTitle") : "What is UGC Video Translation?"}
        </h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 leading-relaxed">
            {hasKey("whatIsContent") ? safeT("whatIsContent") : "UGC Video Translation is the process of localizing short-form content (TikToks, Instagram Reels, YouTube Shorts) for global audiences while preserving the creator's original energy, pacing, and emotional delivery. Unlike long-form content translation, short-form requires precise timing preservation, cultural adaptation of trends, and maintaining the viral DNA that made the original content successful."}
          </p>
        </div>
      </section>

      {/* Why Focus on Short-Form Content */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🚀</span>
          {hasKey("whyTitle") ? safeT("whyTitle") : "Why Focus on Short-Form Content?"}
        </h2>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
          <p className="text-gray-700 leading-relaxed">
            {hasKey("whyContent") ? safeT("whyContent") : "The creator economy has shifted dramatically. While long-form content still matters, the growth engine is now short-form UGC. Creators who successfully translate their viral TikToks and Shorts into multiple languages can 10x their reach and monetization potential. The technical challenge is maintaining the original creator's authentic voice and emotional inflection in 15-60 second clips."}
          </p>
        </div>
      </section>

      {/* Technical Nuances of Short-Form Translation */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">⚙️</span>
          {hasKey("howTitle") ? safeT("howTitle") : "Technical Nuances of Short-Form Translation"}
        </h2>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
            <div className="flex items-start mb-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <h3 className="text-xl font-bold text-purple-900">
                {hasKey("step1Title") ? safeT("step1Title") : "Step 1: Analyze Original Content DNA"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step1Content") ? safeT("step1Content") : "Before translation, identify the viral elements: pacing patterns, emotional beats, jump cuts, sound sync points, and cultural references. Use AI analysis to extract timing markers, energy levels, and emotional transitions that make the original content compelling. This DNA becomes your translation blueprint."}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <div className="flex items-start mb-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <h3 className="text-xl font-bold text-blue-900">
                {hasKey("step2Title") ? safeT("step2Title") : "Step 2: Voice Cloning for Creator Authenticity"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step2Content") ? safeT("step2Content") : "Generate a voice clone that captures the creator's unique vocal characteristics: pitch range, speech rhythm, emotional inflection, and accent patterns. For short-form content, focus on high-energy delivery patterns and quick emotional shifts. The voice model must handle rapid pacing and sudden energy changes without sounding robotic."}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
            <div className="flex items-start mb-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <h3 className="text-xl font-bold text-green-900">
                {hasKey("step3Title") ? safeT("step3Title") : "Step 3: Lip-Sync Precision for Short Clips"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step3Content") ? safeT("step3Content") : "Implement frame-by-frame lip synchronization that matches the original creator's mouth movements and expressions. Short-form content requires sub-frame accuracy due to rapid cuts and close-up shots. Use Curify's enhanced lip-sync pipeline to maintain natural mouth movements during fast-paced segments and emotional moments."}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
            <div className="flex items-start mb-4">
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <h3 className="text-xl font-bold text-orange-900">
                {hasKey("step4Title") ? safeT("step4Title") : "Step 4: Cultural Adaptation of Trends"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step4Content") ? safeT("step4Content") : "Localize not just language but cultural context: trending sounds, meme references, gesture meanings, and platform-specific behaviors. What's viral in the US might not resonate in Japan or Brazil. Adapt cultural references while maintaining the core message and entertainment value that drove the original's success."}
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
            <div className="flex items-start mb-4">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                5
              </div>
              <h3 className="text-xl font-bold text-red-900">
                {hasKey("step5Title") ? safeT("step5Title") : "Step 5: Quality Assurance for Viral Potential"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step5Content") ? safeT("step5Content") : "Test translated content with native speakers from the target market. Verify emotional impact, comedic timing, and cultural resonance. Use A/B testing to compare different emotional deliveries and pacing variations. Ensure the translated content maintains the shareability and engagement potential of the original."}
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Technical Considerations */}
      {hasKey("technicalTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">🔬</span>
            {safeT("technicalTitle")}
          </h2>
          
          <div className="space-y-6">
            {/* Timing */}
            {hasKey("timingTitle") && (
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">
                  {safeT("timingTitle")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {hasKey("timingContent") ? safeT("timingContent") : "Short-form content relies on micro-expressions and split-second emotional changes. Your translation pipeline must capture these nuances: eyebrow raises, subtle smiles, eye movements, and quick glances that convey meaning. Use high-frame-rate processing (60fps+) to maintain timing accuracy."}
                </p>
              </div>
            )}

            {/* Emotion */}
            {hasKey("emotionTitle") && (
              <div className="bg-pink-50 p-6 rounded-xl border border-pink-200">
                <h3 className="text-xl font-bold text-pink-900 mb-4">
                  {safeT("emotionTitle")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {hasKey("emotionContent") ? safeT("emotionContent") : "Map the original creator's emotional journey: build-up, climax, resolution. Apply emotion TTS to preserve these emotional beats in the target language. The challenge is maintaining authentic emotional delivery while adapting linguistic patterns that may have different emotional expression norms."}
                </p>
              </div>
            )}

            {/* Platform */}
            {hasKey("platformTitle") && (
              <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-200">
                <h3 className="text-xl font-bold text-cyan-900 mb-4">
                  {safeT("platformTitle")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {hasKey("platformContent") ? safeT("platformContent") : "Each platform has unique requirements: TikTok's 9:16 aspect ratio, Instagram Reels' vertical format, YouTube Shorts' algorithm preferences. Optimize translated content for each platform's technical specifications and audience behavior patterns."}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tools */}
      {hasKey("toolsTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">🛠️</span>
            {safeT("toolsTitle")}
          </h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              {hasKey("toolsContent") ? safeT("toolsContent") : "Curify's specialized UGC translation pipeline combines voice cloning, lip-sync, and emotion TTS specifically designed for short-form content. The system handles rapid pacing, preserves creator authenticity, and outputs platform-optimized formats automatically."}
            </p>
          </div>
        </section>
      )}

      {/* Monetization */}
      {hasKey("monetizationTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">💰</span>
            {safeT("monetizationTitle")}
          </h2>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
            <p className="text-gray-700 leading-relaxed">
              {hasKey("monetizationContent") ? safeT("monetizationContent") : "Translated UGC opens multiple monetization channels: international brand deals, localized sponsorships, global ad revenue, and cross-platform audience growth. Creators can command premium rates for multilingual content that maintains viral potential across markets."}
            </p>
          </div>
        </section>
      )}

      {/* Case Studies */}
      {hasKey("caseStudiesTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">📈</span>
            {safeT("caseStudiesTitle")}
          </h2>
          
          <div className="space-y-6">
            {/* Case Study 1 */}
            {hasKey("caseStudy1Title") && (
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4">
                  {safeT("caseStudy1Title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {hasKey("caseStudy1Content") ? safeT("caseStudy1Content") : "A fashion creator with 500K followers translated their top 10 TikToks into Spanish, reaching 5M additional viewers. The key was maintaining their energetic delivery and adapting fashion references for Latin American markets."}
                </p>
              </div>
            )}

            {/* Case Study 2 */}
            {hasKey("caseStudy2Title") && (
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  {safeT("caseStudy2Title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {hasKey("caseStudy2Content") ? safeT("caseStudy2Content") : "A comedy creator specialized in sketch content achieved viral success in Japan by translating their Reels with cultural adaptation. The translated content preserved comedic timing while incorporating Japanese humor patterns and cultural references."}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Best Practices */}
      {hasKey("bestPracticesTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">⭐</span>
            {safeT("bestPracticesTitle")}
          </h2>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <p className="text-gray-700 leading-relaxed">
              {hasKey("bestPracticesContent") ? safeT("bestPracticesContent") : "Focus on creator authenticity preservation: maintain original energy levels, respect cultural context, test with target audiences, optimize for each platform's technical requirements, and iterate based on performance metrics. The goal is making translated content feel native to each market while preserving the viral DNA."}
            </p>
          </div>
        </section>
      )}

      {/* Conclusion */}
      {hasKey("conclusionTitle") && (
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-3">🎉</span>
            {safeT("conclusionTitle")}
          </h2>
          <p className="text-lg leading-relaxed">
            {hasKey("conclusionContent") ? safeT("conclusionContent") : "UGC Video Translation represents the next frontier in creator economy expansion. By combining advanced AI translation with cultural intelligence and creator authenticity preservation, you can scale your content globally while maintaining the viral potential that made your original content successful."}
          </p>
        </section>
      )}
    </div>
  );
}
