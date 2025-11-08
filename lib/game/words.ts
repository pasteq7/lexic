// lib/game/words.ts - FIXED VERSION
import { Language } from '@/lib/types/i18n';
import { MIN_WORD_LENGTH, MAX_WORD_LENGTH } from './constants';
import { LetterState } from '@/lib/types/game';
import englishWords from 'an-array-of-english-words';
import frenchWords from 'an-array-of-french-words';

// Initialize word lists with type assertions
const VALID_WORDS: Record<Language, string[]> = {
  en: (englishWords as string[]).filter((word: string) => 
    word.length >= MIN_WORD_LENGTH && 
    word.length <= MAX_WORD_LENGTH &&
    /^[a-zà-ÿ]+$/i.test(word)
  ).map((word: string) => word.toLowerCase()),
  
  fr: (frenchWords as string[]).filter((word: string) => 
    word.length >= MIN_WORD_LENGTH && 
    word.length <= MAX_WORD_LENGTH &&
    /^[a-zà-ÿ]+$/i.test(word)
  ).map((word: string) => word.toLowerCase())
};

// Pre-compute words by length for faster lookup
export const WORDS_BY_LENGTH: Record<Language, Record<number, string[]>> = {
  en: {},
  fr: {}
};

// Initialize word length maps
Object.entries(VALID_WORDS).forEach(([lang, words]) => {
  words.forEach(word => {
    const length = word.length;
    if (!WORDS_BY_LENGTH[lang as Language][length]) {
      WORDS_BY_LENGTH[lang as Language][length] = [];
    }
    WORDS_BY_LENGTH[lang as Language][length].push(word);
  });
});

export function getRandomWord(language: Language = 'en'): string {
  const length = Math.floor(Math.random() * (MAX_WORD_LENGTH - MIN_WORD_LENGTH + 1)) + MIN_WORD_LENGTH;
  const wordsOfLength = WORDS_BY_LENGTH[language][length];
  
  if (!wordsOfLength || wordsOfLength.length === 0) {
    throw new Error(`No ${length}-letter words found for language: ${language}`);
  }
  
  return wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
}

/**
 * Seeded random number generator (Mulberry32)
 * This ensures the same seed always produces the same sequence
 */
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Create a deterministic seed from date and additional offset
 * Uses UTC date to ensure consistency across timezones
 */
function createDailySeed(offset: number = 0): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  
  // Create a unique seed for this date and offset
  // Using prime numbers to ensure better distribution
  return (year * 10000 + month * 100 + day) * 31337 + offset * 7919;
}

/**
 * Get a deterministic word for today based on seed
 * This ensures all users worldwide get the same word on the same day
 * but the word selection appears random
 */
const getDeterministicWord = (language: Language, offset: number): string => {
  const wordList = Object.values(WORDS_BY_LENGTH[language]).flat();

  if (!wordList || wordList.length === 0) {
    console.error(`No words found for language: ${language} to determine a daily word.`);
    return getRandomWord(language);
  }

  // Create a seeded random number generator for this date and offset
  const seed = createDailySeed(offset);
  const random = seededRandom(seed);
  
  // Use the seeded random to select a word
  const index = Math.floor(random() * wordList.length);
  return wordList[index];
}

export function getWordOfTheDay(language: Language = 'en'): string {
  return getDeterministicWord(language, 0);
}

/**
 * Generate a set of unique words for today's set challenge
 * Uses the seeded random approach to ensure consistency
 */
export function getTodaysUniqueSet(language: Language = 'en', size: number = 3): string[] {
  const wordList = Object.values(WORDS_BY_LENGTH[language]).flat();
  
  if (!wordList || wordList.length === 0) {
    console.error(`No words found for language: ${language} to generate today's set.`);
    return [];
  }

  const wordSet = new Set<string>();
  const normalizedWordSet = new Set<string>();
  
  // Create a seeded random generator for today
  const baseSeed = createDailySeed(1000); // Different offset from word of the day
  const random = seededRandom(baseSeed);
  
  // Shuffle the word list deterministically
  const shuffledIndices: number[] = [];
  for (let i = 0; i < wordList.length; i++) {
    shuffledIndices.push(i);
  }
  
  // Fisher-Yates shuffle with seeded random
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }
  
  // Pick unique words from the shuffled list
  for (const index of shuffledIndices) {
    if (wordSet.size >= size) break;
    
    const word = wordList[index];
    const normalizedWord = normalizeWord(word);
    
    if (!normalizedWordSet.has(normalizedWord)) {
      wordSet.add(word);
      normalizedWordSet.add(normalizedWord);
    }
  }

  return Array.from(wordSet);
}

// Add accent normalization helper
export function normalizeWord(word: string): string {
  return word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Update word validation to handle accents better
export function isValidWord(word: string, language: Language): boolean {
  const normalizedInput = normalizeWord(word);
  return VALID_WORDS[language].some(dictWord => 
    normalizeWord(dictWord) === normalizedInput
  );
}

const letterStateStyles = {
  correct: 'bg-correct text-foreground border-primary',
  present: 'bg-present text-foreground border-primary',
  absent: 'bg-transparent text-foreground border-primary',
  empty: 'bg-transparent border-primary/30'
} as const;

export function getLetterStateClass(state: LetterState): string {
  return letterStateStyles[state];
}