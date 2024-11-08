import { useState, useCallback} from 'react';
import { useGameStats } from '@/hooks/stats/useGameStats';
import { GameState, GuessResult } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/lib/i18n/translations';

interface GameLogicState {
  wordLength: number;
  guesses: GuessResult[];
  currentGuess: string;
  gameOver: boolean;
  isSubmitting: boolean;
  revealedAnswer: string | null;
}

interface UseGameLogicProps {
  language: Language;
  maxAttempts?: number;
}

interface SubmitGuessResult {
  isValid: boolean;
  message?: string;
}

export function useGameLogic({ language, maxAttempts = 6 }: UseGameLogicProps) {
  const [state, setState] = useState<GameLogicState>({
    wordLength: 0,
    guesses: [],
    currentGuess: '',
    gameOver: false,
    isSubmitting: false,
    revealedAnswer: null
  });

  const { toast } = useToast();
  const { updateGameResult } = useGameStats();

  const resetGame = useCallback(() => {
    setState({
      wordLength: 0,
      guesses: [],
      currentGuess: '',
      gameOver: false,
      isSubmitting: false,
      revealedAnswer: null
    });
  }, []);

  const newGame = useCallback(async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new', language })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start game');
      }

      setState(prev => ({
        ...prev,
        wordLength: data.length,
        guesses: [],
        currentGuess: '',
        gameOver: false,
        revealedAnswer: null
      }));

      return { success: true };
    } catch (error) {
      console.error('Failed to start new game:', error);
      return { 
        success: false, 
        error: t('failedToStart', language) 
      };
    }
  }, [language]);

  const submitGuess = useCallback(async (guess: string): Promise<SubmitGuessResult> => {
    if (state.isSubmitting || state.gameOver) {
      return { isValid: false };
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    // Validate characters based on language
    const validCharPattern = language === 'fr' 
      ? /^[a-zàâäéèêëîïôöùûüÿçæœ]+$/i
      : /^[a-z]+$/i;

    if (!validCharPattern.test(guess)) {
      return {
        isValid: false,
        message: t('invalidCharacters', language)
      };
    }

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess,
          language,
          guessCount: state.guesses.length
        })
      });

      const data = await response.json();

      if (!data.isValid) {
        return { 
          isValid: false, 
          message: data.message 
        };
      }

      const newGuess: GuessResult = {
        word: guess,
        letterStates: data.letterStates,
        isCorrect: data.isCorrect
      };

      setState(prev => {
        const newGuesses = [...prev.guesses, newGuess];
        const gameOver = data.isCorrect || newGuesses.length >= maxAttempts;

        return {
          ...prev,
          guesses: newGuesses,
          currentGuess: '',
          gameOver: gameOver,
          isSubmitting: false,
          revealedAnswer: gameOver ? data.answer : null
        };
      });

      return { isValid: true };
    } catch (error) {
      console.error('Error submitting guess:', error);
      return { 
        isValid: false, 
        message: t('error', language) 
      };
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.isSubmitting, state.gameOver, state.guesses.length, language, maxAttempts, updateGameResult]);

  return {
    ...state,
    newGame,
    submitGuess,
    updateCurrentGuess: useCallback((guess: string) => {
      if (!state.gameOver) {
        setState(prev => ({ ...prev, currentGuess: guess }));
      }
    }, [state.gameOver]),
    resetGame,
    getGameState: useCallback((): GameState => {
      if (!state.gameOver) return 'playing';
      return state.guesses[state.guesses.length - 1]?.isCorrect ? 'won' : 'lost';
    }, [state.gameOver, state.guesses])
  };
}