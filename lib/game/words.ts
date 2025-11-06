// lib/game/words.ts
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
    /^[a-zÀ-ÿ]+$/i.test(word)
  ).map((word: string) => word.toLowerCase()),
  
  fr: (frenchWords as string[]).filter((word: string) => 
    word.length >= MIN_WORD_LENGTH && 
    word.length <= MAX_WORD_LENGTH &&
    /^[a-zÀ-ÿ]+$/i.test(word)
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

const getDeterministicWord = (language: Language, seed: number): string => {
  const wordList = Object.values(WORDS_BY_LENGTH[language]).flat();

  if (!wordList || wordList.length === 0) {
    console.error(`No words found for language: ${language} to determine a daily word.`);
    return getRandomWord(language);
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const index = (dayOfYear + seed) % wordList.length;
  return wordList[index];
}

export function getWordOfTheDay(language: Language = 'en'): string {
  return getDeterministicWord(language, 0);
}

export function getTodaysUniqueSet(language: Language = 'en', size: number = 3): string[] {
    const wordSet = new Set<string>();
    const normalizedWordSet = new Set<string>();
    let seed = 1; // Start seed for the set (0 is for word of the day)

    while (wordSet.size < size) {
        const word = getDeterministicWord(language, seed);
        const normalizedWord = normalizeWord(word);

        if (!normalizedWordSet.has(normalizedWord)) {
            wordSet.add(word);
            normalizedWordSet.add(normalizedWord);
        }
        seed++;

        // Failsafe to prevent an infinite loop if we can't find unique words
        if (seed > 1000) {
            console.error("Could not generate a unique word set. Breaking loop.");
            break;
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