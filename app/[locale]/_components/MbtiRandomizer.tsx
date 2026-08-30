'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { getCanonicalPath } from '@/lib/canonical';

/**
 * An actual random-MBTI generator for /blog/mbti-character-generator.
 *
 * WHY (measured 2026-08-30, 28-day window). This page ranks **#2 organically**
 * for "random mbti generator" — 88 impressions at position 6.8 — and takes
 * ZERO clicks. Position is not the problem; the result is.
 *
 * Look at who we lose to. Every competitor on that SERP is a widget you operate
 * in one click: Perchance "MBTI Generator", ShindanMaker "gives you a random
 * Myers-Briggs personality type", GoSpinWheel "a quick, fun way to randomly
 * pick one of the 16 MBTI types", spinthewheel.app. We offered an article
 * titled "382 Cards from 10 Universes". Someone searching "random mbti
 * generator" wants to press a button, not to read a catalogue, so they scroll
 * past us to the thing that spins.
 *
 * A previous pass (MbtiUniversePicker, 2026-08-21) attacked the same numbers by
 * adding a universe grid *inside* the page. Nine days later the query still
 * takes zero clicks — because the decision is made on the SERP, and an in-page
 * CTA cannot change what the listing promises. Hence two changes together: this
 * widget, and a title/description that promise the action. Neither works alone.
 *
 * WHY IT RANDOMISES TYPES, NOT CHARACTERS. The obvious version — "spin and get
 * Gaara, INFJ" — would need a trustworthy character→type mapping and we do not
 * have one. The library's `mbti-<type>` tags are demonstrably wrong: 96 items
 * are tagged `mbti-infj`, more than twice any other type, when INFJ is the
 * rarest type in the real distribution. Asserting a wrong type on a page that
 * competes with Personality Database, in a niche whose users argue typing for
 * sport, would cost more credibility than the feature is worth. So the spin is
 * over the 16 canonical types (which needs no data and is exactly what the
 * query asks for) and the character is the *payoff* — you go make one.
 */

type Type = { code: string; name: string; blurb: string };

/** The 16 types. Nicknames are the standard Myers-Briggs ones. */
const TYPES: Type[] = [
  { code: 'INTJ', name: 'The Architect', blurb: 'Strategic, private, allergic to inefficiency.' },
  { code: 'INTP', name: 'The Logician', blurb: 'Endlessly curious, happiest inside a hard problem.' },
  { code: 'ENTJ', name: 'The Commander', blurb: 'Decisive, direct, already three moves ahead.' },
  { code: 'ENTP', name: 'The Debater', blurb: 'Quick, contrarian, will argue the other side for fun.' },
  { code: 'INFJ', name: 'The Advocate', blurb: 'Quietly intense, driven by a private sense of purpose.' },
  { code: 'INFP', name: 'The Mediator', blurb: 'Idealistic and deeply felt, loyal to their own values.' },
  { code: 'ENFJ', name: 'The Protagonist', blurb: 'Warm and rallying, reads a room instantly.' },
  { code: 'ENFP', name: 'The Campaigner', blurb: 'Bright, spontaneous, allergic to a closed door.' },
  { code: 'ISTJ', name: 'The Logistician', blurb: 'Reliable to a fault, keeps every promise made.' },
  { code: 'ISFJ', name: 'The Defender', blurb: 'Attentive and protective, remembers what you needed.' },
  { code: 'ESTJ', name: 'The Executive', blurb: 'Organised and decisive, runs the thing properly.' },
  { code: 'ESFJ', name: 'The Consul', blurb: 'Generous host, keeps everyone connected.' },
  { code: 'ISTP', name: 'The Virtuoso', blurb: 'Cool under pressure, learns by taking it apart.' },
  { code: 'ISFP', name: 'The Adventurer', blurb: 'Gentle and aesthetic, lives in the present tense.' },
  { code: 'ESTP', name: 'The Entrepreneur', blurb: 'Bold and physical, thrives where it is happening.' },
  { code: 'ESFP', name: 'The Entertainer', blurb: 'Spontaneous and generous, turns it into an occasion.' },
];

/** Universes a result can be turned into a card in. */
const UNIVERSES: { slug: string; name: string }[] = [
  { slug: 'mbti-generic', name: 'Any subject' },
  { slug: 'mbti-marvel', name: 'Marvel' },
  { slug: 'mbti-naruto', name: 'Naruto' },
  { slug: 'mbti-nba', name: 'NBA' },
  { slug: 'mbti-ghibli', name: 'Ghibli' },
  { slug: 'mbti-animal', name: 'Animals' },
];

export default function MbtiRandomizer({ locale }: { locale: string }) {
  const [result, setResult] = useState<Type | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = useCallback(() => {
    setSpinning(true);
    // Land on a type that is not the one already showing, so a second press
    // never looks like a broken button.
    const pool = result ? TYPES.filter((t) => t.code !== result.code) : TYPES;
    const next = pool[Math.floor(Math.random() * pool.length)];
    // Brief shuffle so the result reads as a draw rather than a page update.
    const started = Date.now();
    const tick = setInterval(() => {
      setResult(TYPES[Math.floor(Math.random() * TYPES.length)]);
      if (Date.now() - started > 420) {
        clearInterval(tick);
        setResult(next);
        setSpinning(false);
      }
    }, 60);
  }, [result]);

  return (
    <section className="not-prose my-8 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 sm:p-8">
      <h2 className="m-0 text-xl font-bold text-gray-900">Random MBTI generator</h2>
      <p className="mt-1 mb-5 text-sm text-gray-600">
        Press the button for one of the 16 types — then turn it into a character card.
      </p>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={spin}
          aria-label="Generate a random MBTI type"
          className="flex-none rounded-xl bg-purple-600 px-7 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-purple-700 disabled:opacity-70"
          disabled={spinning}
        >
          {result ? 'Spin again' : 'Generate a random type'}
        </button>

        <div
          aria-live="polite"
          className="flex min-h-[104px] flex-1 items-center justify-center rounded-xl border border-purple-200 bg-white px-5 py-4 text-center"
        >
          {result ? (
            <div>
              <div
                className={`text-4xl font-extrabold tracking-tight text-purple-700 ${
                  spinning ? 'opacity-60' : ''
                }`}
              >
                {result.code}
              </div>
              {!spinning && (
                <>
                  <div className="mt-1 text-base font-semibold text-gray-900">{result.name}</div>
                  <div className="mt-1 text-sm text-gray-600">{result.blurb}</div>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Your type appears here — 16 possible results.
            </div>
          )}
        </div>
      </div>

      {result && !spinning && (
        <div className="mt-5 border-t border-purple-200 pt-4">
          <div className="mb-2 text-sm font-semibold text-gray-900">
            Make {result.code} into a card:
          </div>
          <div className="flex flex-wrap gap-2">
            {UNIVERSES.map((u) => (
              <Link
                key={u.slug}
                href={getCanonicalPath(locale, `/nano-template/${u.slug}`)}
                className="rounded-lg border border-purple-300 bg-white px-3 py-2 text-sm font-medium text-purple-700 no-underline transition-colors hover:bg-purple-600 hover:text-white"
              >
                {u.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
