interface MBTICharacterGeneratorContentProps {
  tNamespace: any;
}

export default function MBTICharacterGeneratorContent({ tNamespace }: MBTICharacterGeneratorContentProps) {
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">
        {tNamespace ? tNamespace("intro.title") : "Introduction"}
      </p>
      <p>{tNamespace ? tNamespace("intro.description1") : ""}</p>
      <p>{tNamespace ? tNamespace("intro.description2") : ""}</p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("whatIs.title") : "What is this?"}</h2>
        <p className="mb-4">{tNamespace ? tNamespace("whatIs.description1") : ""}</p>
        <p className="mb-4">{tNamespace ? tNamespace("whatIs.description2") : ""}</p>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">ð {tNamespace ? tNamespace("whatIs.thinkOfItAs") : ""}</h3>
          <p>{tNamespace ? tNamespace("whatIs.thinkOfItAsDescription") : ""}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("examples.title") : "Examples"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("examples.description") : ""}</p>
        
        <div className="space-y-8">
          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-2xl font-semibold mb-3">ð {tNamespace ? tNamespace("examples.nba.title") : ""}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("examples.nba.description") : ""}</p>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded">
              <a 
                href="https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant"
                className="text-orange-600 hover:text-orange-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant
              </a>
              <div className="mt-3 space-y-2">
                <p><strong>INTJ</strong> ¢ {tNamespace ? tNamespace("examples.nba.intj") : ""}</p>
                <p><strong>ESFP</strong> ¢ {tNamespace ? tNamespace("examples.nba.esfp") : ""}</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-2xl font-semibold mb-3">ð¾ {tNamespace ? tNamespace("examples.animals.title") : ""}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("examples.animals.description") : ""}</p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
              <a 
                href="https://www.curify-ai.com/nano-template/mbti-animal/example/template-mbti-animal-amusement-park%206"
                className="text-green-600 hover:text-green-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.curify-ai.com/nano-template/mbti-animal/example/template-mbti-animal-amusement-park%206
              </a>
              <div className="mt-3 space-y-2">
                <p><strong>INFP</strong> ¢ {tNamespace ? tNamespace("examples.animals.infp") : ""}</p>
                <p><strong>ESTP</strong> ¢ {tNamespace ? tNamespace("examples.animals.estp") : ""}</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-2xl font-semibold mb-3">ð {tNamespace ? tNamespace("examples.movies.title") : ""}</h3>
            <p className="mb-4">{tNamespace ? tNamespace("examples.movies.description") : ""}</p>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
              <a 
                href="https://www.curify-ai.com/nano-template/mbti-generic/example/template-mbti-generic-friends-rachel"
                className="text-purple-600 hover:text-purple-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.curify-ai.com/nano-template/mbti-generic/example/template-mbti-generic-friends-rachel
              </a>
              <div className="mt-3 space-y-2">
                <p><strong>ENFP</strong> ¢ {tNamespace ? tNamespace("examples.movies.enfp") : ""}</p>
                <p><strong>ISTJ</strong> ¢ {tNamespace ? tNamespace("examples.movies.istj") : ""}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("howItWorks.title") : "How It Works"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("howItWorks.description") : ""}</p>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{tNamespace ? tNamespace("howItWorks.behindTheScenes") : ""}</h3>
          <p className="mb-4">{tNamespace ? tNamespace("howItWorks.systemDescription") : ""}</p>
          
          <div className="space-y-3">
            {tNamespace && tNamespace.raw ? tNamespace.raw('howItWorks.components').map((component: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">{component.icon}</span>
                <div>
                  <strong>{component.title}</strong> - {component.description}
                </div>
              </div>
            )) : null}
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded">
            <h4 className="font-semibold mb-2">{tNamespace ? tNamespace("howItWorks.ensures.title") : ""}</h4>
            <ul className="space-y-1">
              {tNamespace && tNamespace.raw ? tNamespace.raw('howItWorks.ensures.items').map((item: string, index: number) => (
                <li key={index}> <strong>{item.split(' - ')[0]}</strong> - {item.split(' - ')[1]}</li>
              )) : null}
            </ul>
          </div>

          <p className="mt-4 italic">
            {tNamespace ? tNamespace("howItWorks.conclusion") : ""}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("whyNotRegular.title") : "Why Not Regular?"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("whyNotRegular.description") : ""}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("whyNotRegular.traditional.title") : ""}</h3>
            <ul className="space-y-2">
              {tNamespace && tNamespace.raw ? tNamespace.raw('whyNotRegular.traditional.items').map((item: string, index: number) => (
                <li key={index}> {item}</li>
              )) : null}
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("whyNotRegular.nanoBanana.title") : ""}</h3>
            <ul className="space-y-2">
              {tNamespace && tNamespace.raw ? tNamespace.raw('whyNotRegular.nanoBanana.items').map((item: string, index: number) => (
                <li key={index}> {item}</li>
              )) : null}
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <p className="text-center font-semibold">
            {tNamespace ? tNamespace("whyNotRegular.conclusion") : ""}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("useCases.title") : "Use Cases"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("useCases.description") : ""}</p>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">ð {tNamespace ? tNamespace("useCases.socialMedia.title") : ""}</h3>
            <ul className="space-y-1">
              {tNamespace && tNamespace.raw ? tNamespace.raw('useCases.socialMedia.items').map((item: string, index: number) => (
                <li key={index}> {item}</li>
              )) : null}
            </ul>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">ð¨ {tNamespace ? tNamespace("useCases.creative.title") : ""}</h3>
            <ul className="space-y-1">
              {tNamespace && tNamespace.raw ? tNamespace.raw('useCases.creative.items').map((item: string, index: number) => (
                <li key={index}> {item}</li>
              )) : null}
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">ð {tNamespace ? tNamespace("useCases.marketing.title") : ""}</h3>
            <ul className="space-y-1">
              {tNamespace && tNamespace.raw ? tNamespace.raw('useCases.marketing.items').map((item: string, index: number) => (
                <li key={index}> {item}</li>
              )) : null}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("tryNow.title") : "Try Now"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("tryNow.description") : ""}</p>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("tryNow.explore.title") : ""}</h3>
            <a 
              href="https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant"
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant
            </a>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3"> {tNamespace ? tNamespace("tryNow.browse.title") : ""}</h3>
            <a 
              href="https://www.curify-ai.com/nano-banana-pro-prompts"
              className="text-green-600 hover:text-green-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.curify-ai.com/nano-banana-pro-prompts
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("customize.title") : "Customize"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("customize.description") : ""}</p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">ð¡ {tNamespace ? tNamespace("customize.bonus.title") : ""}</h3>
          <p className="mb-4">{tNamespace ? tNamespace("customize.bonus.description") : ""}</p>
          <ul className="space-y-2">
            {tNamespace && tNamespace.raw ? tNamespace.raw('customize.bonus.features').map((feature: string, index: number) => (
              <li key={index}> <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</li>
            )) : null}
          </ul>
          <p className="mt-4 italic">
            {tNamespace ? tNamespace("customize.bonus.conclusion") : ""}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("finalThoughts.title") : "Final Thoughts"}</h2>
        <p className="mb-6">{tNamespace ? tNamespace("finalThoughts.description") : ""}</p>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg text-center">
          <p className="font-semibold text-lg">
            {tNamespace ? tNamespace("finalThoughts.formula") : ""}
          </p>
        </div>

        <p className="mt-6">
          {tNamespace ? tNamespace("finalThoughts.conclusion") : ""}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("relatedReads.title") : "Related Reads"}</h2>
        <ul className="space-y-2">
          {tNamespace && tNamespace.raw ? tNamespace.raw('relatedReads.items').map((item: string, index: number) => (
            <li key={index}> {item}</li>
          )) : null}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{tNamespace ? tNamespace("faq.title") : "FAQ"}</h2>
        <div className="space-y-4">
          {tNamespace && tNamespace.raw ? tNamespace.raw('faq.questions').map((faq: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-black dark:text-black-300">{faq.answer}</p>
            </div>
          )) : null}
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
