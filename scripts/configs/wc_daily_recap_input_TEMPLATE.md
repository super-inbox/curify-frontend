# WC Daily Recap — morning data input template

Copy this whole block into chat each morning. Fill in YESTERDAY's results
+ scorers (5-min ESPN / BBC Sport lookup), bump the golden-boot tally,
and the tournament-total. I handle the rest (fixtures pulled from
`lib/wc_2026_schedule.ts`, payload built, Gemini gen, watermark, ingest,
CDN sync, commit).

## Template

```
DATE: 2026-06-XX                  ← today (the recap's "today")

YESTERDAY (2026-06-XX) RESULTS:
- TEAM_A X-Y TEAM_B (Group X, FT) — TEAM_A: Scorer1 NN', Scorer2 NN'; TEAM_B: ScorerA NN'
- TEAM_A X-Y TEAM_B (Group X, FT) — TEAM_A: ...; TEAM_B: (none)
- ...

GOLDEN BOOT LEADERS (current top 3, after yesterday):
- Player Name (COUNTRY) — N goals
- Player Name (COUNTRY) — N goals
- Player Name (COUNTRY) — N goals

TOURNAMENT TOTAL GOALS: NN
```

## Example (the one we already shipped — 2026-06-15)

```
DATE: 2026-06-15

YESTERDAY (2026-06-14) RESULTS:
- Germany 7-1 Curaçao (Group E, FT) — Germany: Felix Nmecha 6', Nico Schlotterbeck 38', Kai Havertz 45+5' PK 88', Jamal Musiala 47', Nathaniel Brown 68', Deniz Unday 78'; Curaçao: Livano Comencenia 21'
- Côte d'Ivoire 1-0 Ecuador (Group E, FT) — Côte d'Ivoire: Amad Diallo 90'; Ecuador: (none)
- Netherlands 2-2 Japan (Group F, FT) — Netherlands: Virgil van Dijk 50', Crysencio Summerville 64'; Japan: Keito Nakamura 57', Daichi Kamada 88'
- Sweden 5-1 Tunisia (Group F, FT) — Sweden: Yasin Ayari 7'+90+6', Alexander Isak 30', Viktor Gyökeres 60', Mattias Svanberg 84'; Tunisia: Omar Rekik 43'

GOLDEN BOOT LEADERS:
- Folarin Balogun (USA) — 2 goals
- Kai Havertz (Germany) — 2 goals
- Yasin Ayari (Sweden) — 2 goals

TOURNAMENT TOTAL GOALS: 38
```

## Notes

- **Today's fixtures** — auto-pulled from `lib/wc_2026_schedule.ts` (real schedule, 72 group-stage matches). I don't need you to type these.
- **Multi-TZ times** — auto-derived from the host-venue TZ (PT/CT/ET) per `project_wc_schedule_timezone_fix` memory.
- **Sample tournament data above is from a Gemini-test exercise** — real values you find on ESPN may differ; whatever you paste is what ships.
- **Scorer minute format flexibility** — `7' + 90+6'` for double scorers, `45+5' PK` for stoppage-time penalty, `(none)` for clean-sheet teams — all render correctly per the Gemini fidelity test.
