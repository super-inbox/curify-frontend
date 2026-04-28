interface BilingualFlashcardsContentProps {
  hasKey: (key: string) => boolean;
  safeT: (key: string, defaultValue?: string) => string;
  formatContent: (content: string) => string;
  getVideoDubbingUrl: (locale: string) => string;
  locale: string;
}

export default function BilingualFlashcardsContent({ 
  hasKey, 
  safeT, 
  formatContent, 
  getVideoDubbingUrl, 
  locale 
}: BilingualFlashcardsContentProps) {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {hasKey("title") ? safeT("title") : "Generating Bilingual AI Flashcards for Early Childhood Education"}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          {hasKey("intro") ? safeT("intro") : "Discover how to create engaging bilingual AI flashcards for early childhood education using Nano Banana. This comprehensive guide shows parents and educators how to generate visual vocabulary cards that make learning fun and effective for young children."}
        </p>
      </section>

      {/* What Are Bilingual AI Flashcards */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🎯</span>
          {hasKey("whatIsTitle") ? safeT("whatIsTitle") : "What Are Bilingual AI Flashcards?"}
        </h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 leading-relaxed">
            {hasKey("whatIsContent") ? safeT("whatIsContent") : "Bilingual AI flashcards are visual learning tools that combine engaging illustrations with text in two languages, helping children build vocabulary and language skills simultaneously. Unlike traditional flashcards, AI-generated cards can be customized for any topic, from animal taxonomy to foundational English vocabulary, making them perfect for early childhood education."}
          </p>
        </div>
      </section>

      {/* Why Focus on Early Childhood Education */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🌟</span>
          {hasKey("whyTitle") ? safeT("whyTitle") : "Why Focus on Early Childhood Education?"}
        </h2>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
          <p className="text-gray-700 leading-relaxed">
            {hasKey("whyContent") ? safeT("whyContent") : "The education tech space is highly lucrative, but many AI tools focus purely on college-level text summarization. Creating highly visual 'knowledge cards' for early childhood education addresses a real market gap—parents and early educators are actively searching for tools that make learning engaging and effective for young children."}
          </p>
        </div>
      </section>

      {/* How to Create Bilingual Flashcards */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🚀</span>
          {hasKey("howTitle") ? safeT("howTitle") : "How to Create Bilingual Flashcards with Nano Banana"}
        </h2>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
            <div className="flex items-start mb-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <h3 className="text-xl font-bold text-purple-900">
                {hasKey("step1Title") ? safeT("step1Title") : "Step 1: Choose Your Learning Theme"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step1Content") ? safeT("step1Content") : "Start by selecting age-appropriate topics that resonate with young learners. Popular themes include animals, colors, shapes, numbers, and everyday objects. The key is choosing subjects that children encounter in their daily lives, making the learning experience more relatable and memorable."}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <div className="flex items-start mb-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <h3 className="text-xl font-bold text-blue-900">
                {hasKey("step2Title") ? safeT("step2Title") : "Step 2: Design Your Visual Template"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step2Content") ? safeT("step2Content") : "Create a consistent visual style that appeals to children. Use bright colors, friendly characters, and clear layouts. Nano Banana allows you to specify illustration styles, character designs, and color schemes that maintain consistency across your entire flashcard set."}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
            <div className="flex items-start mb-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <h3 className="text-xl font-bold text-green-900">
                {hasKey("step3Title") ? safeT("step3Title") : "Step 3: Craft Bilingual Content Structure"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step3Content") ? safeT("step3Content") : "Plan your bilingual approach carefully. Consider language pairing (English-Spanish, English-Chinese, etc.), text placement, and cultural context. Structure each card with the image on one side and bilingual text on the other, or integrate both languages visually in a single design."}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
            <div className="flex items-start mb-4">
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <h3 className="text-xl font-bold text-orange-900">
                {hasKey("step4Title") ? safeT("step4Title") : "Step 4: Generate with AI Prompts"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step4Content") ? safeT("step4Content") : "Use specific, child-friendly prompts that guide the AI to create appropriate content. Include details about age group, learning objectives, and visual preferences. Nano Banana's structured approach ensures each card meets educational standards while remaining engaging."}
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
            <div className="flex items-start mb-4">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                5
              </div>
              <h3 className="text-xl font-bold text-red-900">
                {hasKey("step5Title") ? safeT("step5Title") : "Step 5: Review and Refine"}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-12">
              {hasKey("step5Content") ? safeT("step5Content") : "Evaluate generated flashcards for educational value, cultural accuracy, and age-appropriateness. Test with actual children if possible, and iterate based on feedback. This quality assurance step ensures your flashcards effectively support learning outcomes."}
            </p>
          </div>
        </div>
      </section>

      {/* Copy-Paste Templates */}
      {hasKey("templatesTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">📋</span>
            {safeT("templatesTitle")}
          </h2>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <p className="text-gray-700 mb-6">
              {hasKey("templatesIntro") ? safeT("templatesIntro") : "Use these proven templates to generate high-quality bilingual flashcards instantly:"}
            </p>
            
            <div className="space-y-6">
              {/* Template 1 */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-lg mb-2 text-purple-700">
                  {hasKey("template1Title") ? safeT("template1Title") : "Animal Vocabulary Cards"}
                </h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {hasKey("template1Prompt") ? safeT("template1Prompt") : "Create a set of 10 animal flashcards for preschoolers (ages 3-5). Each card shows: friendly cartoon animal, English name, Spanish translation, simple fact. Use bright colors and rounded corners. Style: educational children's book illustration."}
                </div>
              </div>

              {/* Template 2 */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-lg mb-2 text-blue-700">
                  {hasKey("template2Title") ? safeT("template2Title") : "Color & Shape Learning"}
                </h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {hasKey("template2Prompt") ? safeT("template2Prompt") : "Generate 12 flashcards teaching basic colors and shapes. Each card: colored shape, English name, French translation, pronunciation guide. Use pastel colors and clean design. Target: toddlers (ages 2-4). Style: Montessori educational materials."}
                </div>
              </div>

              {/* Template 3 */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-lg mb-2 text-green-700">
                  {hasKey("template3Title") ? safeT("template3Title") : "Everyday Objects"}
                </h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {hasKey("template3Prompt") ? safeT("template3Prompt") : "Create 15 flashcards of common household objects. Each card: realistic object photo, English label, Chinese characters, pinyin pronunciation. Use neutral background, clear typography. Age: kindergarten (4-6). Style: modern educational photography."}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {hasKey("benefitsTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">💎</span>
            {safeT("benefitsTitle")}
          </h2>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
            <p className="text-gray-700 leading-relaxed">
              {hasKey("benefitsContent") ? safeT("benefitsContent") : "AI-generated bilingual flashcards offer unique advantages: consistent visual style across entire sets, instant customization for different languages, ability to generate large quantities quickly, and incorporation of cultural elements that make learning more meaningful. They're particularly effective for visual learners and bilingual households."}
            </p>
          </div>
        </section>
      )}

      {/* Tools and Resources */}
      {hasKey("toolsTitle") && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">🛠️</span>
            {safeT("toolsTitle")}
          </h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {hasKey("toolsContent") ? safeT("toolsContent") : "While Nano Banana handles the heavy lifting, complement your flashcards with additional tools: pronunciation guides, audio recording apps for native speaker verification, and progress tracking systems to monitor learning advancement."}
            </p>
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
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <p className="text-gray-700 leading-relaxed">
              {hasKey("bestPracticesContent") ? safeT("bestPracticesContent") : "Follow these guidelines for maximum impact: limit text to 3-5 words per card, use high-contrast images for clarity, include phonetic guides for pronunciation, organize cards by difficulty level, and regularly rotate content to maintain engagement."}
            </p>
          </div>
        </section>
      )}

      {/* Conclusion */}
      {hasKey("conclusionTitle") && (
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-3">🎉</span>
            {safeT("conclusionTitle")}
          </h2>
          <p className="text-lg leading-relaxed">
            {hasKey("conclusionContent") ? safeT("conclusionContent") : "By combining AI technology with educational best practices, you can create professional bilingual flashcards that rival commercial educational products. The key is focusing on age-appropriate content, cultural relevance, and consistent visual design that makes learning joyful and effective for young children."}
          </p>
        </section>
      )}
    </div>
  );
}
