// hooks/game/useGameLogic.ts - Enhanced version
import { useState, useCallback} from 'react';
import { GameState, GuessResult, GameMode } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';

interface GameLogicState {
  wordLength: number;
  guesses: GuessResult[];
  currentGuess: string;
  gameOver: boolean;
  isSubmitting: boolean;
  revealedAnswer: string | null;
  isLoading: boolean;
  firstLetter: string;
}

interface UseGameLogicProps {
  language: Language;
  maxAttempts?: number;
  onFirstLetterDeleteAttempt?: () => void; // NEW: Callback for UX feedback
}

interface SubmitGuessResult {
  isValid: boolean;
  message?: string;
}

export function useGameLogic({ 
  language, 
  maxAttempts = 6,
  onFirstLetterDeleteAttempt 
}: UseGameLogicProps) {
  const [state, setState] = useState<GameLogicState>({
    wordLength: 0,
    guesses: [],
    currentGuess: '',
    gameOver: false,
    isSubmitting: false,
    revealedAnswer: null,
    isLoading: false,
    firstLetter: '',
  });

  const resetGame = useCallback(() => {
    setState({
      wordLength: 0,
      guesses: [],
      currentGuess: '',
      gameOver: false,
      isSubmitting: false,
      revealedAnswer: null,
      isLoading: false,
      firstLetter: '',
    });
  }, []);

  const newGame = useCallback(async (options: { gameMode: GameMode }) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new', language, gameMode: options.gameMode })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start game');
      }

      setState(prev => ({
        ...prev,
        wordLength: data.length,
        guesses: [],
        currentGuess: data.firstLetter || '',
        gameOver: false,
        revealedAnswer: null,
        firstLetter: data.firstLetter || '',
      }));

      return { success: true };
    } catch (error) {
      console.error('Failed to start new game:', error);
      return { 
        success: false, 
        error: 'failedToStart'
      };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [language]);

  const submitGuess = useCallback(async (guess: string): Promise<SubmitGuessResult> => {
    if (state.isSubmitting || state.gameOver) {
      return { isValid: false };
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    const validCharPattern = language === 'fr' 
      ? /^[a-zàâäéèêëîïôöùûüÿçæœ]+$/i
      : /^[a-z]+$/i;

    if (!validCharPattern.test(guess)) {
      setState(prev => ({...prev, isSubmitting: false}));
      return {
        isValid: false,
        message: 'invalidCharacters'
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
        const isWon = data.isCorrect;
        const gameOver = isWon || newGuesses.length >= maxAttempts;

        return {
          ...prev,
          guesses: newGuesses,
          currentGuess: gameOver && isWon ? '' : prev.firstLetter,
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
        message: 'error'
      };
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.isSubmitting, state.gameOver, state.guesses.length, language, maxAttempts]);
  
  const updateCurrentGuess = useCallback((guess: string) => {
    if (state.gameOver) return;
    
    // CRITICAL FIX: Prevent deleting first letter
    if (guess.length === 0 || !guess.startsWith(state.firstLetter.toLowerCase())) {
      onFirstLetterDeleteAttempt?.();
      return;
    }
    
    setState(prev => ({ ...prev, currentGuess: guess }));
  }, [state.gameOver, state.firstLetter, onFirstLetterDeleteAttempt]);
  
  const loadInProgressGame = useCallback((savedState: { 
    guesses: GuessResult[], 
    revealedAnswer: string | null 
  }) => {
    const { guesses, revealedAnswer } = savedState;
    const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;
    const isGameOver = !!revealedAnswer || (lastGuess?.isCorrect ?? false) || guesses.length >= maxAttempts;

    setState(prev => ({
      ...prev,
      guesses: guesses,
      currentGuess: isGameOver ? '' : prev.firstLetter,
      gameOver: isGameOver,
      revealedAnswer: revealedAnswer,
    }));
  }, [maxAttempts]);

  return {
    ...state,
    newGame,
    submitGuess,
    updateCurrentGuess,
    resetGame,
    loadInProgressGame,
    getGameState: useCallback((): GameState => {
      if (!state.gameOver) return 'playing';
      return state.guesses[state.guesses.length - 1]?.isCorrect ? 'won' : 'lost';
    }, [state.gameOver, state.guesses])
  };
}