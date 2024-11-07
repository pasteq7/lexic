import { useState, useEffect } from 'react';
import { LetterState, TRIES,  getLanguagePreference, saveLanguagePreference } from '@/lib/words';
import { GuessResult } from '@/lib/words';
import { type Language } from '@/lib/translations';

interface NewGameResponse {
  success: boolean;
  length?: number;
  error?: string;
}

interface GuessResponse {
  isValid: boolean;
  isCorrect?: boolean;
  message?: string;
  guessCount?: number;
  letterStates?: Record<string, string>;
}

export function useGameState(initialLanguage: Language) {
  const [language, setLanguage] = useState<Language>(() => getLanguagePreference());
  const [wordLength, setWordLength] = useState<number>(0);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [letterStates, setLetterStates] = useState<Record<number, LetterState[]>>({});
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (initialLanguage !== language) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    saveLanguagePreference(newLang);
  };

  const newGame = async (): Promise<NewGameResponse> => {
    try {
      // Reset all state first
      setWordLength(0);
      setGuesses([]);
      setCurrentGuess('');
      setGameOver(false);
      setLetterStates({});
      
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new', language })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to start new game: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.length) {
        setWordLength(data.length);
        return { success: true, length: data.length };
      } else {
        throw new Error('Invalid game data received');
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const submitGuess = async (guess: string): Promise<GuessResponse> => {
    try {
      if (guess.length !== wordLength) {
        return {
          isValid: false,
          message: `Word must be ${wordLength} letters`
        };
      }

      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          guess, 
          language,
          expectedLength: wordLength,
          guessCount: guesses.length
        }),
      });

      const result = await response.json();
      
      if (result.isValid) {
        const newGuess: GuessResult = {
          word: guess,
          letterStates: result.letterStates,
          isCorrect: result.isCorrect
        };
        
        setGuesses(prev => {
          const newGuesses = [...prev, newGuess];
          const newLetterStates = newGuesses.reduce((acc, g, index) => {
            acc[index] = g.letterStates;
            return acc;
          }, {} as Record<number, LetterState[]>);
          setLetterStates(newLetterStates);
          return newGuesses;
        });
        
        setCurrentGuess('');
        
        if (result.isCorrect || guesses.length >= TRIES - 1) {
          setGameOver(true);
          if (result.answer) {
            setRevealedAnswer(result.answer);
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error submitting guess:', error);
      return {
        isValid: false,
        message: 'Error validating guess',
      };
    }
  };

  return {
    wordLength,
    guesses,
    currentGuess,
    gameOver,
    letterStates,
    setGuesses,
    setCurrentGuess,
    setGameOver,
    newGame,
    submitGuess,
    language,
    changeLanguage,
    revealedAnswer,
  };
} 