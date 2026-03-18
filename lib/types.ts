/**
 * The shape of a vocabulary card passed to the client.
 * Unused JSON fields (unsplash_query, forvo_word, audio_gender, cefr_level, tags)
 * are stripped on the server before this reaches the browser.
 */
export interface CardItem {
  id: string;
  french: string;
  turkish: string;
  ipa: string;
  example_sentence: string;
  example_translation: string;
  unit: number;
  course: string;
}

/** Sentence practice card — Q&A, translate, fill-blank, listen-respond. */
export interface SentenceCard {
  id: string;
  type: "qa" | "translate" | "fill_blank" | "listen_respond";
  question_fr: string;
  question_tr: string;
  answer_fr: string;
  answer_tr: string;
  hint?: string;
  audio: boolean;
  unit: number;
  tags: string[];
  difficulty: 1 | 2 | 3;
}

/** Card with grammatical gender info — used by gender quiz. */
export interface GenderedCard {
  id: string;
  french: string;
  turkish: string;
  bareWord: string;
  gender: "m" | "f";
  unit: number;
  course: string;
}
