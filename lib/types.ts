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
