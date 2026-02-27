import type { CardItem } from "@/lib/types";

export const PLACEMENT_RESULT_KEY = "fr-tutor-placement-result-v1";
export const MAX_PLACEMENT_QUESTIONS = 12;

export type PlacementQuestionType =
  | "recognition"
  | "audio_recognition"
  | "confusable_pair";

export interface PlacementQuestion {
  id: string;
  type: PlacementQuestionType;
  prompt: string;
  choices: string[];
  answerIndex: number;
  unit: number;
  course: string;
  audioText?: string;
  helper?: string;
}

export interface PlacementTypeStats {
  correct: number;
  total: number;
}

export interface PlacementUnitStats {
  unit: number;
  correct: number;
  total: number;
}

export interface PlacementResult {
  completedAt: string;
  total: number;
  correct: number;
  suggestedCourse: string;
  suggestedUnit: number;
  typeStats: Record<PlacementQuestionType, PlacementTypeStats>;
  unitStats: PlacementUnitStats[];
}

interface ConfusableTemplate {
  left: string;
  right: string;
  prompt: string;
  answer: string;
  helper: string;
}

const CONFUSABLE_TEMPLATES: ConfusableTemplate[] = [
  {
    left: "tu",
    right: "vous",
    prompt: "Resmi bir ortamda yeni tanistigin birine hitap ediyorsun. Hangisi dogru?",
    answer: "vous",
    helper: "Samimi degil, resmi hitap gerekiyor.",
  },
  {
    left: "bonjour",
    right: "salut",
    prompt: "Yakin arkadasina koridorda selam veriyorsun. Hangisi daha uygun?",
    answer: "salut",
    helper: "Arkadas ortaminda samimi ifade tercih edilir.",
  },
  {
    left: "merci",
    right: "s'il vous plait",
    prompt: "Bir garsona siparis verirken nazikce bir sey istiyorsun. Hangisi dogru?",
    answer: "s'il vous plait",
    helper: "Istekte bulunurken kullanilir.",
  },
  {
    left: "bonjour",
    right: "au revoir",
    prompt: "Mekandan ayrilirken veda ediyorsun. Hangisi dogru?",
    answer: "au revoir",
    helper: "Ayrilirken veda ifadesi gerekir.",
  },
];

function randomShuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const output: T[] = [];

  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    output.push(item);
  }

  return output;
}

function choicesForMeaning(card: CardItem, pool: CardItem[]): { choices: string[]; answerIndex: number } {
  const distractors = randomShuffle(
    uniqueBy(
      pool.filter((item) => item.id !== card.id && item.turkish !== card.turkish),
      (item) => item.turkish
    )
  )
    .slice(0, 3)
    .map((item) => item.turkish);

  const choices = randomShuffle([card.turkish, ...distractors]).slice(0, 4);
  const answerIndex = choices.findIndex((choice) => choice === card.turkish);

  return { choices, answerIndex: answerIndex >= 0 ? answerIndex : 0 };
}

function generateRecognitionQuestions(cards: CardItem[], count: number): PlacementQuestion[] {
  return randomShuffle(cards)
    .slice(0, count)
    .map((card) => {
      const { choices, answerIndex } = choicesForMeaning(card, cards);
      return {
        id: `recognition-${card.id}`,
        type: "recognition" as const,
        prompt: `${card.french} ne demek?`,
        choices,
        answerIndex,
        unit: card.unit,
        course: card.course,
      };
    });
}

function generateAudioQuestions(cards: CardItem[], count: number): PlacementQuestion[] {
  return randomShuffle(cards)
    .slice(0, count)
    .map((card) => {
      const { choices, answerIndex } = choicesForMeaning(card, cards);
      return {
        id: `audio-${card.id}`,
        type: "audio_recognition" as const,
        prompt: "Sesi dinle ve dogru anlami sec.",
        choices,
        answerIndex,
        unit: card.unit,
        course: card.course,
        audioText: card.french,
      };
    });
}

function generateConfusableQuestions(cards: CardItem[], count: number): PlacementQuestion[] {
  const byFrench = new Map<string, CardItem>();
  for (const card of cards) {
    byFrench.set(card.french.toLowerCase().trim(), card);
  }

  const questions: PlacementQuestion[] = [];

  for (const template of randomShuffle(CONFUSABLE_TEMPLATES)) {
    const leftCard = byFrench.get(template.left);
    const rightCard = byFrench.get(template.right);
    if (!leftCard || !rightCard) continue;

    const choices = randomShuffle([leftCard.french, rightCard.french]);
    const answerIndex = choices.findIndex(
      (choice) => choice.toLowerCase() === template.answer
    );

    questions.push({
      id: `confusable-${leftCard.id}-${rightCard.id}`,
      type: "confusable_pair",
      prompt: template.prompt,
      helper: template.helper,
      choices,
      answerIndex: answerIndex >= 0 ? answerIndex : 0,
      unit: Math.min(leftCard.unit, rightCard.unit),
      course: leftCard.course,
    });
  }

  return questions.slice(0, count);
}

export function buildPlacementQuestions(cards: CardItem[]): PlacementQuestion[] {
  const usableCards = uniqueBy(cards, (card) => card.id);
  if (usableCards.length === 0) return [];

  const baseCount = Math.min(MAX_PLACEMENT_QUESTIONS, usableCards.length);
  const recognitionCount = Math.min(4, baseCount);
  const audioCount = Math.min(4, Math.max(baseCount - recognitionCount, 0));
  const confusableCount = Math.min(
    4,
    Math.max(baseCount - recognitionCount - audioCount, 0)
  );

  let questions: PlacementQuestion[] = [
    ...generateRecognitionQuestions(usableCards, recognitionCount),
    ...generateAudioQuestions(usableCards, audioCount),
    ...generateConfusableQuestions(usableCards, confusableCount),
  ];

  if (questions.length < baseCount) {
    const remaining = baseCount - questions.length;
    const filler = generateRecognitionQuestions(usableCards, remaining).map((q) => ({
      ...q,
      id: `filler-${q.id}`,
    }));
    questions = [...questions, ...filler];
  }

  return randomShuffle(questions).slice(0, MAX_PLACEMENT_QUESTIONS);
}

export function buildPlacementResult(
  questions: PlacementQuestion[],
  answers: number[]
): PlacementResult {
  const typeStats: Record<PlacementQuestionType, PlacementTypeStats> = {
    recognition: { correct: 0, total: 0 },
    audio_recognition: { correct: 0, total: 0 },
    confusable_pair: { correct: 0, total: 0 },
  };

  const byUnit = new Map<number, PlacementUnitStats>();
  let correct = 0;

  questions.forEach((question, idx) => {
    const isCorrect = answers[idx] === question.answerIndex;
    if (isCorrect) correct += 1;

    typeStats[question.type].total += 1;
    if (isCorrect) typeStats[question.type].correct += 1;

    const unitStats = byUnit.get(question.unit) ?? {
      unit: question.unit,
      correct: 0,
      total: 0,
    };

    unitStats.total += 1;
    if (isCorrect) unitStats.correct += 1;
    byUnit.set(question.unit, unitStats);
  });

  const unitStats = Array.from(byUnit.values()).sort((a, b) => a.unit - b.unit);
  const weakUnit = unitStats.find((stat) => stat.correct / stat.total < 0.75);
  const lastUnit = unitStats[unitStats.length - 1]?.unit ?? 1;
  const maxSeenUnit = unitStats.reduce((max, stat) => Math.max(max, stat.unit), 1);
  const bestCourse = questions[0]?.course ?? "101";
  const suggestedUnit = weakUnit ? weakUnit.unit : Math.min(lastUnit + 1, maxSeenUnit);

  return {
    completedAt: new Date().toISOString(),
    total: questions.length,
    correct,
    suggestedCourse: bestCourse,
    suggestedUnit,
    typeStats,
    unitStats,
  };
}
