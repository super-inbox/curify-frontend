interface ContentTaggingSystemContentProps {
  tNamespace: any;
}

export default function ContentTaggingSystemContent({ tNamespace }: ContentTaggingSystemContentProps) {
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">
        {tNamespace ? tNamespace("intro.title") : "Introduction"}
      </p>
      <p>{tNamespace ? tNamespace("intro.description1") : ""}</p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("whyTagsMatter.title") : "Why Tags Matter"}</h2>
        <p className="mb-4">{tNamespace ? tNamespace("whyTagsMatter.description") : ""}</p>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">ð {tNamespace ? tNamespace("whyTagsMatter.searchability.title") : "Searchability"}</h3>
            <p>{tNamespace ? tNamespace("whyTagsMatter.searchability.description") : ""}</p>
          </div>
          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">ð {tNamespace ? tNamespace("whyTagsMatter.discoverability.title") : "Discoverability"}</h3>
            <p>{tNamespace ? tNamespace("whyTagsMatter.discoverability.description") : ""}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">ð {tNamespace ? tNamespace("whyTagsMatter.contentReuse.title") : "Content reuse"}</h3>
            <p>{tNamespace ? tNamespace("whyTagsMatter.contentReuse.description") : ""}</p>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <p className="text-center font-semibold">
            {tNamespace ? tNamespace("whyTagsMatter.landingPageValue") : ""}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("coreChallenges.title") : "The Core Challenges"}</h2>
        
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("coreChallenges.nonDescriptive.title") : "Non-descriptive tags"}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("coreChallenges.nonDescriptive.description") : ""}</p>
            <div className="space-y-2">
              {tNamespace && tNamespace.raw ? Object.entries(tNamespace.raw('coreChallenges.nonDescriptive.examples')).map(([key, value]: [string, any]) => (
                <p key={key} className="italic">"{value}"</p>
              )) : null}
            </div>
            <p className="mt-4 font-semibold">{tNamespace ? tNamespace("coreChallenges.nonDescriptive.conclusion") : ""}</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("coreChallenges.overlySpecific.title") : "Overly specific (rare) tags"}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("coreChallenges.overlySpecific.description") : ""}</p>
            <p className="italic mb-4">"{tNamespace ? tNamespace("coreChallenges.overlySpecific.example") : ""}"</p>
            <ul className="space-y-1">
              {tNamespace && tNamespace.raw ? Object.entries(tNamespace.raw('coreChallenges.overlySpecific.issues')).map(([key, value]: [string, any]) => (
                <li key={key}> {value}</li>
              )) : null}
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("coreChallenges.promptVsLanguage.title") : "Prompt  Natural Language"}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("coreChallenges.promptVsLanguage.description") : ""}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("coreChallenges.promptVsLanguage.promptTitle") : ""}</p>
                <p className="italic">"{tNamespace ? tNamespace("coreChallenges.promptVsLanguage.promptExample") : ""}"</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("coreChallenges.promptVsLanguage.searchTitle") : ""}</p>
                <p className="italic">"{tNamespace ? tNamespace("coreChallenges.promptVsLanguage.searchExample") : ""}"</p>
              </div>
            </div>
            <p className="mt-4 font-semibold">{tNamespace ? tNamespace("coreChallenges.promptVsLanguage.conclusion") : ""}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("coreChallenges.traditionalMethods.title") : "Traditional methods fall short"}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("coreChallenges.traditionalMethods.description") : ""}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("coreChallenges.traditionalMethods.tfIdf.title") : ""}</p>
                <p> {tNamespace ? tNamespace("coreChallenges.traditionalMethods.tfIdf.good") : ""}</p>
                <p> {tNamespace ? tNamespace("coreChallenges.traditionalMethods.tfIdf.bad") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("coreChallenges.traditionalMethods.imageClustering.title") : ""}</p>
                <p> {tNamespace ? tNamespace("coreChallenges.traditionalMethods.imageClustering.good") : ""}</p>
                <p> {tNamespace ? tNamespace("coreChallenges.traditionalMethods.imageClustering.bad") : ""}</p>
              </div>
            </div>
            <p className="mt-4 font-semibold">{tNamespace ? tNamespace("coreChallenges.traditionalMethods.summary") : ""}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("threeLayerApproach.title") : "A Three-Layer Tagging Approach"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("threeLayerApproach.description") : ""}</p>
        
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Layer 1  Raw Signal Extraction</h3>
            <p className="mb-4">{tNamespace ? tNamespace("threeLayerApproach.layer1.description") : ""}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.prompt") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.promptDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.caption") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.captionDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.objects") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.objectsDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.style") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.styleDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.embeddings") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer1.metadata.embeddingsDesc") : ""}</p>
              </div>
            </div>
            <p className="mt-4">{tNamespace ? tNamespace("threeLayerApproach.layer1.conclusion") : ""}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Layer 2  Candidate Tag Generation</h3>
            <p className="mb-4">{tNamespace ? tNamespace("threeLayerApproach.layer2.description") : ""}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.nounPhrases") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.nounPhrasesDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.styleTerms") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.styleTermsDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.themes") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.themesDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.clusterLabels") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.clusterLabelsDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.llmNormalized") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer2.candidates.llmNormalizedDesc") : ""}</p>
              </div>
            </div>
            <p className="mt-4">{tNamespace ? tNamespace("threeLayerApproach.layer2.conclusion") : ""}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Layer 3  Refinement & Selection (Critical)</h3>
            <p className="mb-4">{tNamespace ? tNamespace("threeLayerApproach.layer3.description") : ""}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-2">Filter Criteria:</p>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.coverage") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.coverageDesc") : ""}</p>
                </div>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.clarity") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.clarityDesc") : ""}</p>
                </div>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.distinctiveness") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.distinctivenessDesc") : ""}</p>
                </div>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.searchIntent") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.criteria.searchIntentDesc") : ""}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.title") : ""}</p>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.subject") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.subjectDesc") : ""}</p>
                </div>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.style") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.styleDesc") : ""}</p>
                </div>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.theme") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.themeDesc") : ""}</p>
                </div>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.useCase") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.useCaseDesc") : ""}</p>
                </div>
                <div className="mb-2">
                  <p className="font-medium">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.mood") : ""}</p>
                  <p className="text-sm text-gray-600">{tNamespace ? tNamespace("threeLayerApproach.layer3.organization.moodDesc") : ""}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("keyInsight.title") : "The Key Insight"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("keyInsight.description") : ""}</p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {tNamespace && tNamespace.raw ? Object.entries(tNamespace.raw('keyInsight.methods')).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="font-semibold">{value.title}</p>
              <p className="text-sm">{value.description}</p>
            </div>
          )) : null}
        </div>
        
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
          <p className="font-semibold text-lg">
            {tNamespace ? tNamespace("keyInsight.solution") : ""}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("pinterestPlatform.title") : "Building Tagging Systems for Pinterest-Like Inspiration Platform"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("pinterestPlatform.description") : ""}</p>
        
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.title") : "Gallery Image Tags"}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.description") : ""}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.subject") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.subjectDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.style") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.styleDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.medium") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.mediumDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.mood") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.moodDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.composition") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.compositionDesc") : ""}</p>
              </div>
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.color") : ""}</p>
                <p className="text-sm text-gray-600">{tNamespace ? tNamespace("pinterestPlatform.galleryTags.examples.colorDesc") : ""}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">{tNamespace ? tNamespace("pinterestPlatform.templateTags.title") : "Template & Template Example Tags"}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("pinterestPlatform.templateTags.description") : ""}</p>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.templateTags.geoTags.title") : "Geographic Tags"}</p>
                <p className="text-sm text-gray-600 mb-2">{tNamespace ? tNamespace("pinterestPlatform.templateTags.geoTags.description") : ""}</p>
                <div className="flex flex-wrap gap-2">
                  {tNamespace && tNamespace.raw ? tNamespace.raw('pinterestPlatform.templateTags.geoTags.examples').map((tag: string, index: number) => (
                    <span key={index} className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-sm">{tag}</span>
                  )) : null}
                </div>
              </div>
              
              <div>
                <p className="font-semibold">{tNamespace ? tNamespace("pinterestPlatform.templateTags.languageTags.title") : "Language Tags"}</p>
                <p className="text-sm text-gray-600 mb-2">{tNamespace ? tNamespace("pinterestPlatform.templateTags.languageTags.description") : ""}</p>
                <div className="flex flex-wrap gap-2">
                  {tNamespace && tNamespace.raw ? tNamespace.raw('pinterestPlatform.templateTags.languageTags.examples').map((tag: string, index: number) => (
                    <span key={index} className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm">{tag}</span>
                  )) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("ruleOfThumb.title") : "A Simple Rule of Thumb"}</h2>
        <p className="mb-4">{tNamespace ? tNamespace("ruleOfThumb.question") : ""}</p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <p className="text-center font-semibold text-lg mb-4">
            "{tNamespace ? tNamespace("ruleOfThumb.description") : ""}"
          </p>
          <p className="text-center font-semibold">
            {tNamespace ? tNamespace("ruleOfThumb.action") : ""}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("finalThought.title") : "Final Thought"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("finalThought.description") : ""}</p>
        
        <div className="space-y-2">
          {tNamespace && tNamespace.raw ? Object.entries(tNamespace.raw('finalThought.systems')).map(([key, value]: [string, any]) => (
            <p key={key}> {value}</p>
          )) : null}
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg text-center">
          <p className="font-semibold text-lg">
            {tNamespace ? tNamespace("finalThought.conclusion") : ""}
          </p>
        </div>
      </section>

      <footer className="border-t pt-8">
        <div className="flex flex-wrap gap-4 mb-6">
          {tNamespace && tNamespace.raw ? tNamespace.raw('footer.tags').map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm text-blue-800 dark:text-blue-100">{tag}</span>
          )) : null}
        </div>
        
        <div className="text-white">
          <p>{tNamespace ? tNamespace("footer.questions") : ""}</p>
        </div>
      </footer>
    </div>
  );
}
