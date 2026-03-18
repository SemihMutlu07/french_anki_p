# CLAUDE.md — FR Tutor Project Instructions

## Project
FR101 French learning app for 25 Boğaziçi University students. Mobile-first, audio-heavy, no-anxiety design.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth: magic link, DB: Postgres, Storage: audio files)
- FSRS algorithm for spaced repetition (already implemented in lib/fsrs.ts)
- Curriculum: JSON files in curriculum/101/

## Key Files
- PROJECT_PLAN.md — full product plan, sprint breakdown, file structure
- fr101.md — teacher's notes and grammar reference
- curriculum/courseGroups.ts — unit definitions
- curriculum/101/*.json — flashcard data

## Card JSON Schema
```json
{
  "id": "unit11-famille-01",
  "french": "le frère",
  "turkish": "erkek kardeş",
  "ipa": "/fʁɛʁ/",
  "example_sentence": "C'est mon frère.",
  "example_translation": "Bu benim erkek kardeşim.",
  "unsplash_query": "brother family",
  "forvo_word": "frère",
  "audio_gender": "m",
  "cefr_level": "A1",
  "unit": 11,
  "course": "101",
  "tags": ["famille"]
}
```

## Rules
- Mobile-first always. Test at 375px width minimum.
- Touch targets: 44x44px minimum.
- No horizontal scroll ever.
- Audio: single <audio> element via ref. Handle play() rejection gracefully.
- Feminen/maskülen: show article color (blue=m, pink/red=f) on every card.
- Turkish UI language. French content only.
- No gamification anxiety (no streaks, no lives, no penalties).
- Performance: lazy load heavy components, SVG over images, preload="none" for audio.
- TypeScript strict mode. No `any` types.
- Tailwind only, no CSS modules. Use cn() utility for conditional classes.
- Surgical edits. Don't rewrite files unnecessarily.