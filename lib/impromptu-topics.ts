// lib/impromptu-topics.ts
//
// Topic bank for /tools/impromptu-speech-practice.
//
// Provenance: curated by hand from raw/imprompto-08-29/topic-themes.txt — real
// Toastmasters-style table-topics material collected over years of running
// sessions, not generated. That provenance is the point: the competing pages
// all advertise a generic "500+ topics" list, and a smaller bank of questions
// that have actually been put to a room is the differentiator. Do not pad this
// list with model-written filler.
//
// Curation rules applied to the raw file, and to keep applying:
//   * answerable in 90 seconds by someone with no preparation
//   * no sexual, alcohol- or self-harm-adjacent prompts, and no dated gender
//     framing ("who should be the boss, husband or wife?") — students are a
//     named target segment for this page
//   * no SMS shorthand ("u", "ur"), no garbled lines, no club-only questions
//     ("how did you feel about today's meeting?")
//   * hyper-local references generalised (a Dubai shopping festival became
//     "an attraction in your country")
//
// IDs are short and opaque (v01, h07, …) rather than slugified text, because
// they are public in ?topic=<id> links. Copy edits must not break a shared URL.
// Append new topics with the next free number in their theme; never renumber.

export type TopicTheme = "values" | "hypothetical" | "personal" | "society" | "fun";

export type ImpromptuTopic = {
  id: string;
  text: string;
  theme: TopicTheme;
};

export const TOPIC_THEMES: {
  id: TopicTheme;
  label: string;
  blurb: string;
}[] = [
  { id: "values", label: "Values & beliefs", blurb: "Questions with no right answer. Pick a side in the first ten seconds — the hesitation is what costs you the speech." },
  { id: "hypothetical", label: "If you could…", blurb: "The classic impromptu opener. The trap is describing the wish instead of answering the question — say what you would choose, then spend the rest of the time on why." },
  { id: "personal", label: "Your own life", blurb: "The easiest to speak on and the easiest to ramble through. Choose one specific memory, not the whole category." },
  { id: "society", label: "Society & debate", blurb: "Contest topics. Take a position, give two reasons, concede one point to the other side — that concession is what makes you sound credible." },
  { id: "fun", label: "Just for fun", blurb: "Deliberately absurd. Good for loosening up before a real session, and good practice at committing to a premise instead of arguing with it." },
];

export const IMPROMPTU_TOPICS: ImpromptuTopic[] = [
  // ---- Values & beliefs ----
  { id: "v01", text: "Belief, hope or love — which matters most?", theme: "values" },
  { id: "v02", text: "Is honesty always the best policy?", theme: "values" },
  { id: "v03", text: "Some people say a little white lie is sometimes okay. What do you think?", theme: "values" },
  { id: "v04", text: "Beauty or intelligence — which would you rather have?", theme: "values" },
  { id: "v05", text: "Health, wealth or wisdom — if you could keep only one, which and why?", theme: "values" },
  { id: "v06", text: "Which is better: the power of love, or the love of power?", theme: "values" },
  { id: "v07", text: "Live for the moment, or plan for the future?", theme: "values" },
  { id: "v08", text: "Children need love most when they deserve it least. Do you agree?", theme: "values" },
  { id: "v09", text: "Behind every successful person there is someone who believed in them. Do you agree?", theme: "values" },
  { id: "v10", text: "Hard work and success are a chicken-and-egg story. Which comes first?", theme: "values" },
  { id: "v11", text: "The chicken is involved, but the pig is committed. In life, which are you?", theme: "values" },
  { id: "v12", text: "Your most embarrassing moment can be the first step towards success. Do you agree?", theme: "values" },
  { id: "v13", text: "A shop assistant gives you a dollar too much in change. Do you say anything?", theme: "values" },
  { id: "v14", text: "If your business partner was unethical but making good money, would you stay?", theme: "values" },
  { id: "v15", text: "If you could see the future but not change it, would you want to?", theme: "values" },
  // ---- If you could… ----
  { id: "h01", text: "You find Aladdin's lamp. What do you wish for?", theme: "hypothetical" },
  { id: "h02", text: "If you were granted any one magical power, what would you pick?", theme: "hypothetical" },
  { id: "h03", text: "If you could be invisible for a day, what would you do?", theme: "hypothetical" },
  { id: "h04", text: "Talk to animals, or see into the future — which would you choose?", theme: "hypothetical" },
  { id: "h05", text: "If you could be any age again for one week, what age and why?", theme: "hypothetical" },
  { id: "h06", text: "If you could go back in time and talk to yourself at ten, what advice would you give?", theme: "hypothetical" },
  { id: "h07", text: "You get one round trip in a time machine. How far into the past or future do you go?", theme: "hypothetical" },
  { id: "h08", text: "If you could travel back to meet anyone in your family's history, who would it be?", theme: "hypothetical" },
  { id: "h09", text: "If there is one thing in world history you could change, what would it be and why?", theme: "hypothetical" },
  { id: "h10", text: "If you had a lot of money and could use it any way you wanted, what would you do?", theme: "hypothetical" },
  { id: "h11", text: "If you won a million tomorrow, what would you do with it?", theme: "hypothetical" },
  { id: "h12", text: "If you could buy any rare collection in the world, which would you choose?", theme: "hypothetical" },
  { id: "h13", text: "If you could fly a hot-air balloon over any city in the world, which city?", theme: "hypothetical" },
  { id: "h14", text: "You are going to the moon and can take one companion. Who do you take?", theme: "hypothetical" },
  { id: "h15", text: "If you were chosen to represent your country on a spaceship, would you accept?", theme: "hypothetical" },
  { id: "h16", text: "If you had to pick a new first name for yourself, what would you choose?", theme: "hypothetical" },
  { id: "h17", text: "You must wear a button with five words on it. What does it say, and why?", theme: "hypothetical" },
  { id: "h18", text: "If you could have had a different career, what would it be and why?", theme: "hypothetical" },
  { id: "h19", text: "If you led your country for one week, what would you do?", theme: "hypothetical" },
  { id: "h20", text: "If you were captain of your national team, what would you change?", theme: "hypothetical" },
  { id: "h21", text: "You wake up tomorrow grown up with children of your own. What would you do differently?", theme: "hypothetical" },
  { id: "h22", text: "If you could change one thing about your parents, what would it be?", theme: "hypothetical" },
  { id: "h23", text: "If you could choose to stay single or be married, which would you pick?", theme: "hypothetical" },
  { id: "h24", text: "Your parents ask you to come home and leave a good career behind. Would you go?", theme: "hypothetical" },
  { id: "h25", text: "Would you like an identical twin? What would be best about it, and worst?", theme: "hypothetical" },
  { id: "h26", text: "Receive a gift you really wanted, or give someone a gift they would treasure?", theme: "hypothetical" },
  { id: "h27", text: "Would you give up all surprises if you could instead ask for anything and get it?", theme: "hypothetical" },
  { id: "h28", text: "You have enough credit for one last phone call. Who do you call, and why?", theme: "hypothetical" },
  // ---- Your own life ----
  { id: "p01", text: "What do you regret most, and why?", theme: "personal" },
  { id: "p02", text: "What was the hardest choice you have ever made?", theme: "personal" },
  { id: "p03", text: "Which difficulty in your life made you stronger?", theme: "personal" },
  { id: "p04", text: "What is the wisest decision you have ever made?", theme: "personal" },
  { id: "p05", text: "Which one person has shaped your life the most, and how?", theme: "personal" },
  { id: "p06", text: "How did you put right a bad decision you had made?", theme: "personal" },
  { id: "p07", text: "What is your biggest weakness, and what are you doing about it?", theme: "personal" },
  { id: "p08", text: "What scares you even though you know there is no reason to be afraid?", theme: "personal" },
  { id: "p09", text: "Do you remember your first car?", theme: "personal" },
  { id: "p10", text: "What was your nickname when you were six or seven?", theme: "personal" },
  { id: "p11", text: "What is your longest-lasting nickname?", theme: "personal" },
  { id: "p12", text: "Which book has influenced you the most, and why?", theme: "personal" },
  { id: "p13", text: "What good book have you read lately?", theme: "personal" },
  { id: "p14", text: "What makes a friendship last?", theme: "personal" },
  { id: "p15", text: "What is your favourite season of the year, and why?", theme: "personal" },
  { id: "p16", text: "What do people think they know about your hometown that isn't true?", theme: "personal" },
  { id: "p17", text: "What is the most enjoyable way to spend twenty-five dollars?", theme: "personal" },
  { id: "p18", text: "What is your idea of a dream holiday?", theme: "personal" },
  { id: "p19", text: "Which place would you most like to visit next year?", theme: "personal" },
  { id: "p20", text: "Which country would you like to visit, and why?", theme: "personal" },
  { id: "p21", text: "Which country would you want to settle in, and why?", theme: "personal" },
  { id: "p22", text: "What attraction in your country should everyone see at least once?", theme: "personal" },
  { id: "p23", text: "Which televised sporting event is an absolute must-watch for you?", theme: "personal" },
  // ---- Society & debate ----
  { id: "s01", text: "Do you agree with the way we educate children today?", theme: "society" },
  { id: "s02", text: "What is the least education any person should have, and why?", theme: "society" },
  { id: "s03", text: "Should children be given more freedom?", theme: "society" },
  { id: "s04", text: "Adults can do more but carry more responsibility; children play more but are told what to do. Who has the better deal?", theme: "society" },
  { id: "s05", text: "Is it fun to be a parent? If not, why do people have children?", theme: "society" },
  { id: "s06", text: "Should beauty contests be banned?", theme: "society" },
  { id: "s07", text: "Is giving people nicknames a good thing?", theme: "society" },
  { id: "s08", text: "Mobile phones — a nuisance, or the best tool we have?", theme: "society" },
  { id: "s09", text: "Modern life creates more problems than it solves. Do you agree?", theme: "society" },
  { id: "s10", text: "Traffic is a menace, and you are part of it. Comment.", theme: "society" },
  { id: "s11", text: "Should cities charge drivers a toll to reduce traffic?", theme: "society" },
  { id: "s12", text: "Space tourism — if you got the chance, would you go?", theme: "society" },
  { id: "s13", text: "Which single invention changed the course of human history, and why?", theme: "society" },
  { id: "s14", text: "What can young people today realistically hope for?", theme: "society" },
  { id: "s15", text: "Marriage — bliss or disaster?", theme: "society" },
  { id: "s16", text: "Love at first sight — do you believe in it?", theme: "society" },
  // ---- Just for fun ----
  { id: "f01", text: "A snake crosses the road in front of you. What do you do?", theme: "fun" },
  { id: "f02", text: "Your date stands you up. What do you do?", theme: "fun" },
  { id: "f03", text: "You are a fly asleep on the tail fin of a Boeing 747. You wake up doing 400 miles an hour. How do you feel?", theme: "fun" },
  { id: "f04", text: "You are a dentist and you pull the wrong tooth. How do you plead your case?", theme: "fun" },
  { id: "f05", text: "You reach the airport just in time and realise you forgot your tickets. Now what?", theme: "fun" },
  { id: "f06", text: "If you could be anywhere in the world for New Year's Eve, where would you be?", theme: "fun" },
];

export const TOPICS_BY_THEME: Record<TopicTheme, ImpromptuTopic[]> =
  TOPIC_THEMES.reduce(
    (acc, th) => {
      acc[th.id] = IMPROMPTU_TOPICS.filter((t) => t.theme === th.id);
      return acc;
    },
    {} as Record<TopicTheme, ImpromptuTopic[]>,
  );

export function getTopicById(id: string | null | undefined) {
  if (!id) return null;
  return IMPROMPTU_TOPICS.find((t) => t.id === id) ?? null;
}

/**
 * Draw a random topic, never returning `excludeId` twice in a row. Callers pass
 * the currently-shown topic so "Draw another" always visibly changes.
 */
export function drawTopic(excludeId?: string | null): ImpromptuTopic {
  const pool =
    IMPROMPTU_TOPICS.length > 1 && excludeId
      ? IMPROMPTU_TOPICS.filter((t) => t.id !== excludeId)
      : IMPROMPTU_TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}
