import englishWords from 'an-array-of-english-words';
import frenchWords from 'an-array-of-french-words';
import { TranslationKey } from './translations';

// Add type definitions for the imported arrays
const englishWordsArray: string[] = englishWords as string[];
const frenchWordsArray: string[] = frenchWords as string[];

export const MIN_WORD_LENGTH = 4;
export const MAX_WORD_LENGTH = 8;
export const TRIES = 6;

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Filter only 5-letter words and convert to lowercase
export const VALID_WORDS_EN = englishWordsArray
  .filter((word: string) => 
    word.length >= MIN_WORD_LENGTH && 
    word.length <= MAX_WORD_LENGTH &&
    /^[a-zÀ-ÿ]+$/i.test(word)
  )
  .map((word: string) => word.toLowerCase());

export const VALID_WORDS_FR = frenchWordsArray
  .filter((word: string) => 
    word.length >= MIN_WORD_LENGTH && 
    word.length <= MAX_WORD_LENGTH &&
    /^[a-zÀ-ÿ]+$/i.test(word)
  )
  .map((word: string) => word.toLowerCase());

export type ValidWord = (typeof VALID_WORDS_EN)[number] | (typeof VALID_WORDS_FR)[number];

// Pre-compute words by length for faster lookup
export const WORDS_BY_LENGTH: Record<string, Record<number, string[]>> = {
  en: {},
  fr: {}
};

// Initialize once at startup
VALID_WORDS_EN.forEach(word => {
  if (!WORDS_BY_LENGTH.en[word.length]) {
    WORDS_BY_LENGTH.en[word.length] = [];
  }
  WORDS_BY_LENGTH.en[word.length].push(word);
});

VALID_WORDS_FR.forEach(word => {
  if (!WORDS_BY_LENGTH.fr[word.length]) {
    WORDS_BY_LENGTH.fr[word.length] = [];
  }
  WORDS_BY_LENGTH.fr[word.length].push(word);
});

// Update getRandomWord to use pre-computed arrays
export function getRandomWord(language: Language = 'en'): string {
  const length = Math.floor(Math.random() * (MAX_WORD_LENGTH - MIN_WORD_LENGTH + 1)) + MIN_WORD_LENGTH;
  const wordsOfLength = WORDS_BY_LENGTH[language][length];
  
  if (!wordsOfLength || wordsOfLength.length === 0) {
    throw new Error(`No ${length}-letter words found for language: ${language}`);
  }
  
  return wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
}

export function isWordValid(word: string, expectedLength: number, language: Language = 'en'): boolean {
  // Check length and basic pattern first
  if (word.length !== expectedLength || !/^[a-z]+$/.test(word.toLowerCase())) {
    return false;
  }
  
  // Pass the language parameter to isValidGuess
  return isValidGuess(word, language);
}
  
export type LetterState = "correct" | "present" | "absent" | "empty";

export function getLetterStates(
  guess: string, 
  answer: string, 
): LetterState[] {
  const states: LetterState[] = Array(guess.length).fill('absent');
  const answerLetters = removeAccents(answer.toLowerCase()).split('');
  const guessLetters = removeAccents(guess.toLowerCase()).split('');

  // First pass: mark correct letters
  guessLetters.forEach((letter, i) => {
    if (letter === answerLetters[i]) {
      states[i] = 'correct';
      answerLetters[i] = '#'; // Mark as used
    }
  });

  // Second pass: mark present letters
  guessLetters.forEach((letter, i) => {
    if (states[i] === 'correct') return;
    
    const answerIndex = answerLetters.indexOf(letter);
    if (answerIndex !== -1) {
      states[i] = 'present';
      answerLetters[answerIndex] = '#'; // Mark as used
    }
  });

  return states;
}

// Add more game states
export type GameState = 'playing' | 'won' | 'lost';

// Add statistics interface
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastPlayed: number;
  lastCompleted: number;
  guessHistory: GuessResult[];
}

// Add helper function for stats
export function createInitialStats(): GameStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: Array(TRIES).fill(0),
    lastPlayed: Date.now(),
    lastCompleted: 0,
    guessHistory: []
  };
}

// Add function to update stats
export function updateGameStats(stats: GameStats, won: boolean, guessCount: number): GameStats {
  return {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (won ? 1 : 0),
    currentStreak: won ? stats.currentStreak + 1 : 0,
    maxStreak: won ? Math.max(stats.maxStreak, stats.currentStreak + 1) : stats.maxStreak,
    guessDistribution: stats.guessDistribution.map((count, index) => 
      index === guessCount - 1 && won ? count + 1 : count
    ),
    lastCompleted: Date.now()
  };
}

// Add validation for guessed words
export function isValidGuess(word: string, language: Language = 'en'): boolean {
  if (!word) return false;
  const normalizedWord = removeAccents(word.toLowerCase());
  const wordList = language === 'en' ? VALID_WORDS_EN : VALID_WORDS_FR;
  return wordList.some(validWord => 
    removeAccents(validWord) === normalizedWord
  );
}

export function validateGuess(
  word: string, 
  expectedLength: number, 
  language: Language
): { isValid: boolean; message?: TranslationKey } {
  const normalizedWord = word.toLowerCase();

  if (normalizedWord.length !== expectedLength) {
    return { 
      isValid: false, 
      message: 'wordLength'
    };
  }
  
  if (!/^[a-zÀ-ÿ]+$/i.test(normalizedWord)) {
    return { 
      isValid: false, 
      message: 'invalidCharacters'
    };
  }
  
  const wordList = language === 'en' ? VALID_WORDS_EN : VALID_WORDS_FR;
  if (!wordList.some(validWord => 
    removeAccents(validWord) === removeAccents(normalizedWord)
  )) {
    return { 
      isValid: false, 
      message: 'notInWordList'
    };
  }
  
  return { isValid: true };
}

// Add these new helper functions
export function getLetterStateClass(state: LetterState): string {
  switch (state) {
    case 'correct':
      return 'bg-[hsl(var(--correct))] text-primary border-transparent';
    case 'present':
      return 'bg-[hsl(var(--present))] text-primary border-transparent';
    case 'absent':
      return 'bg-transparent text-primary border-transparent';
    case 'empty':
    default:
      return 'bg-transparent';
  }
}

export function calculateStats(guesses: string[], answer: string): {
  correctLetters: number;
  presentLetters: number;
} {
  const states = getLetterStates(guesses[guesses.length - 1] || '', answer );
  return {
    correctLetters: states.filter(s => s === 'correct').length,
    presentLetters: states.filter(s => s === 'present').length,
  };
}

// Add at the top
export type Language = 'en' | 'fr';

// Add language settings helper
export function saveLanguagePreference(lang: Language) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('lexic-language', lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }
}

export function getLanguagePreference(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('lexic-language');
    return (saved === 'en' || saved === 'fr') ? saved : 'en';
  } catch (error) {
    console.error('Failed to get language preference:', error);
    return 'en';
  }
}

// Add new types
export interface GuessResult {
  word: string;
  letterStates: LetterState[];
  isCorrect: boolean;
}