import { TranslationKey } from '@/lib/types/i18n';
import { Language } from '@/lib/types/i18n';
import { isValidWord } from '@/lib/game/words';
import { LetterState } from '../types/game';
import { MIN_WORD_LENGTH, MAX_WORD_LENGTH } from './constants';

export interface ValidationResult {
  isValid: boolean;
  message?: TranslationKey;
}

export function validateGuess(
  word: string, 
  expectedLength: number, 
  language: Language
): ValidationResult {
  const normalizedWord = word.toLowerCase();

  // Check length
  if (normalizedWord.length !== expectedLength) {
    return { 
      isValid: false, 
      message: 'wordLength'
    };
  }
  
  // Check characters
  if (!/^[a-zÀ-ÿ]+$/i.test(normalizedWord)) {
    return { 
      isValid: false, 
      message: 'invalidCharacters'
    };
  }
  
  // Check if word exists in dictionary
  if (!isValidWord(normalizedWord, language)) {
    return { 
      isValid: false, 
      message: 'notInWordList'
    };
  }
  
  return { isValid: true };
}

// Helper function to remove accents for comparison
export function normalizeWord(word: string): string {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Validate word length range
export function isValidWordLength(length: number): boolean {
  return length >= MIN_WORD_LENGTH && length <= MAX_WORD_LENGTH;
}

export function getLetterStates(guess: string, answer: string): LetterState[] {
  const states: LetterState[] = Array(guess.length).fill('absent');
  
  // Normalize both strings for comparison
  const normalizedAnswer = normalizeWord(answer.toLowerCase()).split('');
  const normalizedGuess = normalizeWord(guess.toLowerCase()).split('');
  
  // First pass: mark correct letters
  normalizedGuess.forEach((letter, i) => {
    if (letter === normalizedAnswer[i]) {
      states[i] = 'correct';
      normalizedAnswer[i] = '#'; // Mark as used
    }
  });

  // Second pass: mark present letters
  normalizedGuess.forEach((letter, i) => {
    if (states[i] !== 'correct') {
      const answerIndex = normalizedAnswer.indexOf(letter);
      if (answerIndex !== -1) {
        states[i] = 'present';
        normalizedAnswer[answerIndex] = '#'; // Mark as used
      }
    }
  });

  return states;
}