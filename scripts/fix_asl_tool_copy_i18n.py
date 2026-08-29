#!/usr/bin/env python3
"""Correct the ASL tool copy that still describes an unreleased demo.

The tool went to `status: "create"` on 2026-08-16 and has been billing users since,
but the copy in all 10 locales still says "Join Early Access", "Demo-only today"
and, in the FAQ, "Is it available today? Not yet." Users were told in writing that
they could not use the tool, on the same page that charged them for using it. As of
2026-08-29 it is live and free, and the copy has to say so.

The second correction is about accuracy rather than availability. The FAQ now states
plainly what produces the translation — a general-purpose vision model, not a model
trained on sign language — because the previous copy did not, and because this tool's
audience bears the cost of a confident wrong caption.

    python3 scripts/fix_asl_tool_copy_i18n.py

NOT covered here, deliberately — flagged for a follow-up:
  aslVideoTranslator.deep.how.p2 / p3 describe "a vision encoder ... sign-aware
  embeddings" and "a translation head ... trained on parallel ASL-English video
  corpora". No such component exists; the pipeline samples JPEG stills and sends
  them to a general VLM. That is long-form SEO body copy in 10 languages and
  rewriting it is a content decision, not a bugfix. The new faq.a1 contradicts it
  directly in the place users actually read.
  aslVideoTranslator.why.point2 ("Built for content, not lab demos") is similarly
  unsupported.
"""
import json
import pathlib

# (namespace path, per-locale text)
PATCHES = {
    "aslVideoTranslator.cta": {
        "en": "Try It Free",
        "zh": "免费试用",
        "es": "Pruébelo gratis",
        "fr": "Essayer gratuitement",
        "de": "Kostenlos testen",
        "ja": "無料で試す",
        "ko": "무료로 사용해 보기",
        "hi": "मुफ़्त आज़माएँ",
        "tr": "Ücretsiz deneyin",
        "ru": "Попробовать бесплатно",
    },
    "aslVideoTranslator.description": {
        "en": "Translate American Sign Language video into English text or subtitles, automatically. Free while experimental: upload your clip and check the result yourself — machine translation of sign language is unreliable and the output needs review.",
        "zh": "自动将美国手语（ASL）视频翻译成英文文本或字幕。实验阶段免费开放：上传你的视频并自行核对结果——手语机器翻译并不可靠，输出内容需要人工检查。",
        "es": "Traduzca automáticamente vídeos en Lengua de Signos Americana a texto o subtítulos en inglés. Gratuito mientras es experimental: suba su clip y revise usted mismo el resultado; la traducción automática de lengua de signos no es fiable y su salida necesita revisión.",
        "fr": "Traduisez automatiquement des vidéos en langue des signes américaine en texte ou sous-titres anglais. Gratuit tant que c'est expérimental : téléversez votre clip et vérifiez vous-même le résultat — la traduction automatique de la langue des signes n'est pas fiable et sa sortie doit être contrôlée.",
        "de": "Übersetzen Sie Videos in Amerikanischer Gebärdensprache automatisch in englischen Text oder Untertitel. Kostenlos, solange es experimentell ist: Laden Sie Ihren Clip hoch und prüfen Sie das Ergebnis selbst – die maschinelle Übersetzung von Gebärdensprache ist unzuverlässig und muss kontrolliert werden.",
        "ja": "アメリカ手話の動画を英語のテキストや字幕に自動で翻訳します。実験段階につき無料です。ご自身の動画をアップロードし、結果はご自身でご確認ください。手話の機械翻訳は信頼性が低く、出力には点検が必要です。",
        "ko": "미국 수어 영상을 영어 텍스트나 자막으로 자동 번역합니다. 실험 단계라 무료입니다. 영상을 올리고 결과를 직접 확인해 주세요 — 수어 기계 번역은 신뢰하기 어렵고 결과는 사람이 점검해야 합니다.",
        "hi": "अमेरिकी सांकेतिक भाषा के वीडियो को अपने आप अंग्रेज़ी टेक्स्ट या उपशीर्षक में बदलें। प्रयोगात्मक चरण में मुफ़्त: अपना वीडियो अपलोड करें और नतीजा ख़ुद जाँचें — सांकेतिक भाषा का मशीनी अनुवाद भरोसेमंद नहीं है और उसे जाँचने की ज़रूरत होती है।",
        "tr": "Amerikan İşaret Dili videolarını otomatik olarak İngilizce metne veya altyazıya çevirin. Deneysel olduğu sürece ücretsiz: videonuzu yükleyin ve sonucu kendiniz kontrol edin — işaret dilinin makine çevirisi güvenilir değildir ve çıktının denetlenmesi gerekir.",
        "ru": "Автоматически переводите видео на американском жестовом языке в английский текст или субтитры. Бесплатно, пока функция экспериментальная: загрузите свой ролик и проверьте результат сами — машинный перевод жестового языка ненадёжен, и его нужно проверять.",
    },
    "aslVideoTranslator.metadata.description": {
        "en": "Translate ASL sign language video into English text or subtitles automatically. Free and experimental — upload your own signed footage and see what it reads.",
        "zh": "自动将 ASL 手语视频翻译成英文文本或字幕。免费、实验性功能——上传你自己的手语视频，看看识别结果。",
        "es": "Traduzca automáticamente vídeos en lengua de signos ASL a texto o subtítulos en inglés. Gratuito y experimental: suba su propio vídeo signado y vea qué lee.",
        "fr": "Traduisez automatiquement des vidéos en langue des signes ASL en texte ou sous-titres anglais. Gratuit et expérimental : téléversez votre propre vidéo signée et voyez ce qu'il en lit.",
        "de": "Übersetzen Sie ASL-Gebärdensprachvideos automatisch in englischen Text oder Untertitel. Kostenlos und experimentell – laden Sie Ihr eigenes gebärdetes Video hoch und sehen Sie, was gelesen wird.",
        "ja": "ASL（アメリカ手話）の動画を英語のテキストや字幕に自動翻訳します。無料・実験的機能です。ご自身の手話動画をアップロードして、読み取り結果をご確認ください。",
        "ko": "ASL 수어 영상을 영어 텍스트나 자막으로 자동 번역합니다. 무료이며 실험 기능입니다 — 직접 촬영한 수어 영상을 올려 결과를 확인해 보세요.",
        "hi": "ASL सांकेतिक भाषा के वीडियो को अपने आप अंग्रेज़ी टेक्स्ट या उपशीर्षक में बदलें। मुफ़्त और प्रयोगात्मक — अपना संकेत-भाषा वीडियो अपलोड करें और देखें कि यह क्या पढ़ता है।",
        "tr": "ASL işaret dili videolarını otomatik olarak İngilizce metne veya altyazıya çevirin. Ücretsiz ve deneysel — kendi işaret dili videonuzu yükleyin ve neyi okuduğunu görün.",
        "ru": "Автоматически переводите видео на жестовом языке ASL в английский текст или субтитры. Бесплатно и экспериментально — загрузите собственное видео с жестами и посмотрите, что получится.",
    },
    "aslVideoTranslator.why.point4": {
        "en": "Free and experimental. ASL translation is a hard, unsolved problem — the output is unverified machine translation and is often wrong, so check it against the signing before you publish it.",
        "zh": "免费且处于实验阶段。手语翻译是一个尚未解决的难题——输出是未经校验的机器翻译，经常出错，发布前请对照视频中的手语核对。",
        "es": "Gratuito y experimental. La traducción de lengua de signos es un problema difícil y sin resolver: el resultado es traducción automática sin verificar y a menudo se equivoca, así que compruébelo con lo que se signa antes de publicarlo.",
        "fr": "Gratuit et expérimental. La traduction de la langue des signes est un problème difficile et non résolu : la sortie est une traduction automatique non vérifiée, souvent erronée. Vérifiez-la avec ce qui est signé avant de la publier.",
        "de": "Kostenlos und experimentell. Die Übersetzung von Gebärdensprache ist ein schwieriges, ungelöstes Problem: Die Ausgabe ist ungeprüfte maschinelle Übersetzung und häufig falsch. Prüfen Sie sie anhand der Gebärden, bevor Sie sie veröffentlichen.",
        "ja": "無料・実験段階です。手話翻訳は未解決の難しい課題で、出力は未検証の機械翻訳であり誤りが多く含まれます。公開の前に映像の手話と照らし合わせてご確認ください。",
        "ko": "무료이며 실험 단계입니다. 수어 번역은 아직 풀리지 않은 어려운 문제입니다. 결과는 검수되지 않은 기계 번역이며 자주 틀리므로, 공개하기 전에 영상 속 수어와 대조해 확인해 주세요.",
        "hi": "मुफ़्त और प्रयोगात्मक। सांकेतिक भाषा का अनुवाद एक कठिन, अनसुलझी समस्या है — नतीजा बिना जाँचा हुआ मशीनी अनुवाद है और अक्सर ग़लत होता है, इसलिए प्रकाशित करने से पहले वीडियो की संकेत-भाषा से मिलान कर लें।",
        "tr": "Ücretsiz ve deneysel. İşaret dili çevirisi zor ve henüz çözülmemiş bir problemdir: çıktı doğrulanmamış makine çevirisidir ve sık sık hatalıdır; yayımlamadan önce videodaki işaretlerle karşılaştırın.",
        "ru": "Бесплатно и экспериментально. Перевод жестового языка — сложная и нерешённая задача: результат представляет собой непроверенный машинный перевод и часто содержит ошибки, поэтому сверьте его с жестами в видео перед публикацией.",
    },
    "aslVideoTranslator.faq.a1": {
        "en": "Yes, and it is free. It is also experimental: the translation is produced by a general-purpose vision model, not a model trained on sign language, and it is frequently wrong — sometimes in ways that read as fluent and confident. Treat the output as a draft to check, not a finished translation, and never publish it as an accessibility caption without review.",
        "zh": "可以使用，而且免费。但它仍是实验性功能：翻译由通用视觉模型生成，而非专门针对手语训练的模型，出错频繁——有时错误读起来还很通顺、很笃定。请把结果当作需要核对的草稿，而不是最终译文；未经审核，切勿将其作为无障碍字幕发布。",
        "es": "Sí, y es gratuito. También es experimental: la traducción la produce un modelo de visión de propósito general, no un modelo entrenado en lengua de signos, y se equivoca con frecuencia, a veces de un modo que suena fluido y seguro. Trate el resultado como un borrador que hay que comprobar, no como una traducción terminada, y nunca lo publique como subtítulo de accesibilidad sin revisarlo.",
        "fr": "Oui, et c'est gratuit. C'est aussi expérimental : la traduction est produite par un modèle de vision généraliste, non par un modèle entraîné sur la langue des signes, et elle se trompe fréquemment — parfois d'une manière qui paraît fluide et assurée. Considérez le résultat comme un brouillon à vérifier, pas comme une traduction finie, et ne le publiez jamais comme sous-titre d'accessibilité sans relecture.",
        "de": "Ja, und er ist kostenlos. Er ist außerdem experimentell: Die Übersetzung stammt von einem allgemeinen Bildmodell, nicht von einem auf Gebärdensprache trainierten Modell, und sie ist häufig falsch – teils auf eine Weise, die flüssig und selbstsicher klingt. Behandeln Sie die Ausgabe als zu prüfenden Entwurf, nicht als fertige Übersetzung, und veröffentlichen Sie sie niemals ungeprüft als barrierefreien Untertitel.",
        "ja": "はい、ご利用いただけます。無料です。ただし実験的な機能です。翻訳は手話向けに学習したモデルではなく汎用の視覚モデルが生成しており、誤りが頻繁に含まれます。しかもその誤りが、自然で自信のある文章に見えることがあります。出力は確認が必要な下書きとして扱い、完成した翻訳とはお考えにならないでください。未確認のままアクセシビリティ用の字幕として公開することは避けてください。",
        "ko": "예, 사용할 수 있고 무료입니다. 다만 실험적인 기능입니다. 번역은 수어를 학습한 모델이 아니라 범용 영상 인식 모델이 생성하며 자주 틀립니다. 게다가 그 오류가 자연스럽고 확신에 찬 문장처럼 보일 수 있습니다. 결과물은 완성된 번역이 아니라 확인이 필요한 초안으로 다루시고, 검수 없이 접근성 자막으로 공개하지 마세요.",
        "hi": "हाँ, और यह मुफ़्त है। यह प्रयोगात्मक भी है: अनुवाद सांकेतिक भाषा पर प्रशिक्षित किसी मॉडल से नहीं, बल्कि एक सामान्य दृष्टि मॉडल से बनता है और अक्सर ग़लत होता है — कभी-कभी इस तरह कि वह सहज और आश्वस्त लगता है। नतीजे को तैयार अनुवाद नहीं, बल्कि जाँचने योग्य मसौदा मानें, और बिना समीक्षा के इसे सुगम्यता उपशीर्षक के रूप में कभी प्रकाशित न करें।",
        "tr": "Evet, kullanılabilir ve ücretsizdir. Aynı zamanda deneyseldir: çeviriyi işaret dili üzerinde eğitilmiş bir model değil, genel amaçlı bir görü modeli üretir ve sık sık yanılır — üstelik bazen akıcı ve kendinden emin görünen bir biçimde. Çıktıyı bitmiş bir çeviri değil, kontrol edilmesi gereken bir taslak olarak görün ve gözden geçirmeden erişilebilirlik altyazısı olarak asla yayımlamayın.",
        "ru": "Да, и это бесплатно. Функция при этом экспериментальная: перевод создаёт универсальная модель компьютерного зрения, а не модель, обученная на жестовом языке, и она часто ошибается — порой так, что текст выглядит гладким и уверенным. Относитесь к результату как к черновику, который нужно проверить, а не как к готовому переводу, и никогда не публикуйте его как субтитры для доступности без проверки.",
    },
    "aslVideoTranslator.deep.how.p5": {
        "en": "The demo on this page is the live pipeline running on one real conversational ASL clip. Your own uploads run through the same pipeline, with the same limitations.",
        "zh": "本页的演示就是线上流程在一段真实 ASL 对话视频上的运行结果。你自己上传的视频走的是同一套流程，也有同样的局限。",
        "es": "La demostración de esta página es la línea de procesamiento real ejecutándose sobre un clip conversacional de ASL. Sus propios vídeos pasan por el mismo proceso, con las mismas limitaciones.",
        "fr": "La démonstration de cette page est le pipeline réel appliqué à un clip conversationnel en ASL. Vos propres téléversements passent par le même pipeline, avec les mêmes limites.",
        "de": "Die Demo auf dieser Seite ist die reale Pipeline, angewendet auf einen echten ASL-Gesprächsclip. Ihre eigenen Uploads durchlaufen dieselbe Pipeline – mit denselben Einschränkungen.",
        "ja": "このページのデモは、実際のパイプラインを一本の本物のASL会話動画に対して実行した結果です。お客様がアップロードする動画も同じパイプラインを通り、同じ制約を受けます。",
        "ko": "이 페이지의 데모는 실제 파이프라인을 실제 ASL 대화 영상 한 편에 적용한 결과입니다. 직접 올리시는 영상도 같은 파이프라인을 거치며, 같은 한계를 갖습니다.",
        "hi": "इस पृष्ठ का डेमो वही वास्तविक पाइपलाइन है, जो एक असली ASL बातचीत क्लिप पर चलाई गई है। आपके अपने अपलोड भी उसी पाइपलाइन से गुज़रते हैं — और उन्हीं सीमाओं के साथ।",
        "tr": "Bu sayfadaki demo, gerçek işlem hattının gerçek bir ASL sohbet klibi üzerinde çalıştırılmasıdır. Kendi yüklemeleriniz de aynı hattan geçer — aynı sınırlarla birlikte.",
        "ru": "Демонстрация на этой странице — это реальный конвейер, запущенный на одном настоящем разговорном ролике на ASL. Ваши загрузки проходят тот же конвейер — с теми же ограничениями.",
    },
    "tools.asl_video_translator.meta.description": {
        "en": "Sign language video translator (ASL → English). Translate signed footage into English text and subtitles. Free and experimental — upload your own ASL video.",
        "zh": "手语视频翻译工具（ASL → 英文）。将手语视频转成英文文本与字幕。免费、实验性功能——欢迎上传你自己的 ASL 视频。",
        "es": "Traductor de vídeo en lengua de signos (ASL → inglés). Convierta vídeos signados en texto y subtítulos en inglés. Gratuito y experimental: suba su propio vídeo en ASL.",
        "fr": "Traducteur vidéo de langue des signes (ASL → anglais). Convertissez des vidéos signées en texte et sous-titres anglais. Gratuit et expérimental : téléversez votre propre vidéo en ASL.",
        "de": "Videoübersetzer für Gebärdensprache (ASL → Englisch). Wandeln Sie gebärdete Videos in englischen Text und Untertitel um. Kostenlos und experimentell – laden Sie Ihr eigenes ASL-Video hoch.",
        "ja": "手話動画翻訳ツール（ASL → 英語）。手話の映像を英語のテキストと字幕に変換します。無料・実験的機能です。ご自身のASL動画をアップロードしてお試しください。",
        "ko": "수어 영상 번역기(ASL → 영어). 수어 영상을 영어 텍스트와 자막으로 변환합니다. 무료이며 실험 기능입니다 — 직접 촬영한 ASL 영상을 올려 보세요.",
        "hi": "सांकेतिक भाषा वीडियो अनुवादक (ASL → अंग्रेज़ी)। संकेत-भाषा के वीडियो को अंग्रेज़ी टेक्स्ट और उपशीर्षक में बदलें। मुफ़्त और प्रयोगात्मक — अपना ASL वीडियो अपलोड करें।",
        "tr": "İşaret dili video çevirmeni (ASL → İngilizce). İşaret dili videolarını İngilizce metne ve altyazıya dönüştürün. Ücretsiz ve deneysel — kendi ASL videonuzu yükleyin.",
        "ru": "Переводчик видео на жестовом языке (ASL → английский). Превращайте видео с жестами в английский текст и субтитры. Бесплатно и экспериментально — загрузите собственное видео на ASL.",
    },
}


def set_path(obj: dict, dotted: str, value: str) -> bool:
    parts = dotted.split(".")
    for part in parts[:-1]:
        if part not in obj or not isinstance(obj[part], dict):
            return False
        obj = obj[part]
    if parts[-1] not in obj:
        return False
    obj[parts[-1]] = value
    return True


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent / "messages"
    locales = sorted({loc for texts in PATCHES.values() for loc in texts})
    failures = []
    for locale in locales:
        path = root / locale / "home.json"
        if not path.exists():
            print(f"  SKIP {locale}: {path} not found")
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        applied = 0
        for dotted, texts in PATCHES.items():
            if locale not in texts:
                continue
            if set_path(data, dotted, texts[locale]):
                applied += 1
            else:
                failures.append(f"{locale}:{dotted}")
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"  wrote {locale}: {applied}/{len(PATCHES)} keys")

    if failures:
        print("\n  MISSING KEYS (not written, existing structure differs):")
        for f in failures:
            print(f"    {f}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
