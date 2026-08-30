#!/usr/bin/env python3
"""Add the ASL job-warning banner strings to every locale's common.json.

One-off, idempotent, follows the convention of the other add_*_i18n scripts here:
patch all 10 locale files in a single pass, then run `npm run i18n:check`.

Why all ten and not just English: i18n/request.ts sets neither `onError` nor
`getMessageFallback`, so a key missing from one locale renders the dotted key path
as visible text to that user. AslUnverifiedNotice also guards with `t.has()`, but
that is a safety net, not a substitute for the copy existing.

    python3 scripts/add_asl_job_warning_i18n.py
"""
import json
import pathlib

NAMESPACE = "jobWarnings"

STRINGS = {
    "en": {
        "aslUnverifiedTitle": "Machine translation — not verified by a human",
        "aslUnverifiedBody": "Sign language translation is experimental and often wrong, including in ways that read as fluent and confident. Please check these captions against the signing before relying on them or publishing them.",
        "aslLowConfidenceTitle": "We could not read this video well",
        "aslLowConfidenceBody": "This video was too long or too sparsely sampled for us to read reliably, and parts of the transcript below are likely invented. Please do not publish these captions without checking them against the signing.",
    },
    "zh": {
        "aslUnverifiedTitle": "机器翻译 — 未经人工校验",
        "aslUnverifiedBody": "手语翻译目前仍是实验性功能，经常出错，而且错误往往读起来通顺、语气笃定。请先对照视频中的手语核对字幕，再使用或发布。",
        "aslLowConfidenceTitle": "我们无法准确识别这段视频",
        "aslLowConfidenceBody": "这段视频过长或采样过于稀疏，我们无法可靠识别，下方字幕中有部分内容很可能是凭空生成的。请务必对照视频中的手语核对后再发布。",
    },
    "es": {
        "aslUnverifiedTitle": "Traducción automática: no verificada por una persona",
        "aslUnverifiedBody": "La traducción de lengua de signos es experimental y con frecuencia se equivoca, a veces de un modo que suena fluido y seguro. Compruebe estos subtítulos con lo que se signa en el vídeo antes de utilizarlos o publicarlos.",
        "aslLowConfidenceTitle": "No hemos podido leer bien este vídeo",
        "aslLowConfidenceBody": "Este vídeo era demasiado largo o se muestreó de forma demasiado dispersa para leerlo con fiabilidad, y es probable que parte de la transcripción esté inventada. No publique estos subtítulos sin contrastarlos con lo que se signa.",
    },
    "fr": {
        "aslUnverifiedTitle": "Traduction automatique — non vérifiée par un humain",
        "aslUnverifiedBody": "La traduction de la langue des signes est expérimentale et souvent erronée, parfois d'une manière qui paraît fluide et assurée. Vérifiez ces sous-titres avec ce qui est signé dans la vidéo avant de vous y fier ou de les publier.",
        "aslLowConfidenceTitle": "Nous n'avons pas pu bien lire cette vidéo",
        "aslLowConfidenceBody": "Cette vidéo était trop longue ou échantillonnée de façon trop clairsemée pour être lue de manière fiable, et une partie de la transcription ci-dessous est probablement inventée. Ne publiez pas ces sous-titres sans les vérifier avec ce qui est signé.",
    },
    "de": {
        "aslUnverifiedTitle": "Maschinelle Übersetzung – nicht von einem Menschen geprüft",
        "aslUnverifiedBody": "Die Übersetzung von Gebärdensprache ist experimentell und häufig falsch, teils auf eine Weise, die flüssig und selbstsicher klingt. Bitte prüfen Sie diese Untertitel anhand der Gebärden im Video, bevor Sie sich darauf verlassen oder sie veröffentlichen.",
        "aslLowConfidenceTitle": "Wir konnten dieses Video nicht gut lesen",
        "aslLowConfidenceBody": "Dieses Video war zu lang oder wurde zu spärlich abgetastet, um es zuverlässig zu lesen; Teile der Abschrift unten sind wahrscheinlich erfunden. Bitte veröffentlichen Sie diese Untertitel nicht, ohne sie anhand der Gebärden zu prüfen.",
    },
    "ja": {
        "aslUnverifiedTitle": "機械翻訳です — 人によるチェックは行われていません",
        "aslUnverifiedBody": "手話の翻訳は実験的な機能で、誤りが多く含まれます。しかもその誤りは、自然で自信のある文章に見えることがあります。字幕をご利用・公開になる前に、映像の手話と照らし合わせてご確認ください。",
        "aslLowConfidenceTitle": "この動画をうまく読み取れませんでした",
        "aslLowConfidenceBody": "この動画は長すぎるか、サンプリングが粗すぎたため確実に読み取れず、以下の字幕には作り出された内容が含まれている可能性が高いです。映像の手話と照合せずに公開しないでください。",
    },
    "ko": {
        "aslUnverifiedTitle": "기계 번역입니다 — 사람이 검수하지 않았습니다",
        "aslUnverifiedBody": "수어 번역은 실험적인 기능이며 오류가 잦습니다. 게다가 그 오류가 자연스럽고 확신에 찬 문장처럼 보일 수 있습니다. 자막을 사용하거나 공개하기 전에 영상 속 수어와 대조해 확인해 주세요.",
        "aslLowConfidenceTitle": "이 영상을 제대로 읽지 못했습니다",
        "aslLowConfidenceBody": "이 영상은 너무 길거나 표본이 너무 성겨 안정적으로 읽을 수 없었으며, 아래 자막 중 일부는 지어낸 내용일 가능성이 높습니다. 영상 속 수어와 대조하지 않은 채로 공개하지 마세요.",
    },
    "hi": {
        "aslUnverifiedTitle": "मशीनी अनुवाद — किसी व्यक्ति ने इसे जाँचा नहीं है",
        "aslUnverifiedBody": "सांकेतिक भाषा का अनुवाद प्रयोगात्मक है और अक्सर ग़लत होता है — कई बार इस तरह कि वह सहज और आश्वस्त लगता है। इन उपशीर्षकों पर भरोसा करने या इन्हें प्रकाशित करने से पहले वीडियो में की गई संकेत-भाषा से इनका मिलान कर लें।",
        "aslLowConfidenceTitle": "हम इस वीडियो को ठीक से नहीं पढ़ पाए",
        "aslLowConfidenceBody": "यह वीडियो इतना लंबा था या इसके इतने कम नमूने लिए जा सके कि इसे भरोसे के साथ पढ़ा नहीं जा सका, और नीचे दी गई प्रतिलिपि का कुछ हिस्सा संभवतः गढ़ा हुआ है। वीडियो की संकेत-भाषा से मिलान किए बिना इन उपशीर्षकों को प्रकाशित न करें।",
    },
    "tr": {
        "aslUnverifiedTitle": "Makine çevirisi — bir insan tarafından doğrulanmadı",
        "aslUnverifiedBody": "İşaret dili çevirisi deneyseldir ve sık sık hatalıdır; üstelik bu hatalar akıcı ve kendinden emin görünebilir. Bu altyazılara güvenmeden veya onları yayımlamadan önce videodaki işaretlerle karşılaştırarak kontrol edin.",
        "aslLowConfidenceTitle": "Bu videoyu iyi okuyamadık",
        "aslLowConfidenceBody": "Bu video güvenilir biçimde okunamayacak kadar uzundu veya çok seyrek örneklendi; aşağıdaki metnin bir bölümü büyük olasılıkla uydurulmuştur. Bu altyazıları videodaki işaretlerle karşılaştırmadan yayımlamayın.",
    },
    "ru": {
        "aslUnverifiedTitle": "Машинный перевод — не проверен человеком",
        "aslUnverifiedBody": "Перевод жестового языка — экспериментальная функция, и он часто ошибается, причём порой так, что текст выглядит гладким и уверенным. Пожалуйста, сверьте эти субтитры с жестами в видео, прежде чем полагаться на них или публиковать их.",
        "aslLowConfidenceTitle": "Нам не удалось разобрать это видео",
        "aslLowConfidenceBody": "Это видео оказалось слишком длинным или было размечено слишком редкими кадрами, чтобы прочитать его надёжно; часть расшифровки ниже, скорее всего, выдумана. Не публикуйте эти субтитры, не сверив их с жестами в видео.",
    },
}


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent / "messages"
    for locale, strings in STRINGS.items():
        path = root / locale / "common.json"
        if not path.exists():
            print(f"  SKIP {locale}: {path} not found")
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        existing = data.get(NAMESPACE, {})
        merged = {**existing, **strings}
        if existing == merged and NAMESPACE in data:
            print(f"  ok   {locale}: already present")
            continue
        data[NAMESPACE] = merged
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"  wrote {locale}: {NAMESPACE} ({len(strings)} keys)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
