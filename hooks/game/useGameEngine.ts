// hooks/game/useGameEngine.ts
import { useReducer, useCallback } from 'react';
import { GameMode, GuessResult } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';
import { TRIES } from '@/lib/game/constants';
import { TranslationKey } from '@/lib/types/i18n';

// 1. Define the single, comprehensive state object for the entire game
export interface GameEngineState {
  wordLength: number;
  guesses: GuessResult[];
  currentGuess: string;
  gameOver: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  revealedAnswer: string | null;
  firstLetter: string;
  gameMode: GameMode;
  language: Language;
  shake: boolean;
  // FIX: Replaced 'any' with more specific types for better type safety.
  toast: { messageKey: TranslationKey; params?: Record<string, string | number>, type: 'destructive' | 'success' | 'info' } | null;
}

// 2. Define all possible state transitions (actions)
type GameAction =
  | { type: 'START_NEW_GAME'; payload: { gameMode: GameMode; language: Language } }
  | { type: 'NEW_GAME_SUCCESS'; payload: { wordLength: number; firstLetter: string } }
  | { type: 'NEW_GAME_FAILURE'; payload: { error: TranslationKey } }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'SUBMIT_SUCCESS'; payload: { newGuess: GuessResult; isGameOver: boolean; answer?: string } }
  | { type: 'SUBMIT_FAILURE'; payload: { messageKey: TranslationKey } }
  | { type: 'UPDATE_CURRENT_GUESS'; payload: { newGuess: string } }
  | { type: 'LOAD_IN_PROGRESS_GAME'; payload: { guesses: GuessResult[]; revealedAnswer: string | null, wordLength: number, firstLetter: string } }
  | { type: 'RESET_SHAKE' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'RESET_GAME' };

const initialState: GameEngineState = {
  wordLength: 0,
  guesses: [],
  currentGuess: '',
  gameOver: false,
  isSubmitting: false,
  isLoading: true,
  revealedAnswer: null,
  firstLetter: '',
  gameMode: 'infinite',
  language: 'en',
  shake: false,
  toast: null,
};

// 3. The reducer function handles all state updates atomically and predictably
function gameReducer(state: GameEngineState, action: GameAction): GameEngineState {
  switch (action.type) {
    case 'START_NEW_GAME':
      return { ...initialState, isLoading: true, gameMode: action.payload.gameMode, language: action.payload.language };

    case 'NEW_GAME_SUCCESS':
      return {
        ...state,
        wordLength: action.payload.wordLength,
        firstLetter: action.payload.firstLetter,
        currentGuess: action.payload.firstLetter,
        isLoading: false,
        guesses: [],
        gameOver: false,
        revealedAnswer: null,
      };

    case 'NEW_GAME_FAILURE':
      return { ...state, isLoading: false, toast: { messageKey: action.payload.error, type: 'destructive' } };

    case 'UPDATE_CURRENT_GUESS':
      if (state.gameOver) return state;
      if (action.payload.newGuess.length < state.firstLetter.length || !action.payload.newGuess.toLowerCase().startsWith(state.firstLetter.toLowerCase())) {
        return { ...state, shake: true };
      }
      return { ...state, currentGuess: action.payload.newGuess };
      
    case 'SUBMIT_GUESS':
      return { ...state, isSubmitting: true };

    case 'SUBMIT_SUCCESS': {
      const { newGuess, isGameOver, answer } = action.payload;
      const newGuesses = [...state.guesses, newGuess];
      return {
        ...state,
        isSubmitting: false,
        guesses: newGuesses,
        currentGuess: isGameOver ? '' : state.firstLetter,
        gameOver: isGameOver,
        revealedAnswer: answer || null,
      };
    }

    case 'SUBMIT_FAILURE':
      return { ...state, isSubmitting: false, shake: true, toast: { messageKey: action.payload.messageKey, type: 'destructive' } };
      
    case 'LOAD_IN_PROGRESS_GAME': {
      const { guesses, revealedAnswer, wordLength, firstLetter } = action.payload;
      const isGameOver = !!revealedAnswer || guesses.length >= TRIES || (guesses.length > 0 && guesses[guesses.length - 1].isCorrect);
      return {
        ...state,
        guesses,
        revealedAnswer,
        wordLength,
        firstLetter,
        currentGuess: isGameOver ? '' : firstLetter,
        gameOver: isGameOver,
        isLoading: false,
      };
    }

    case 'RESET_SHAKE':
      return { ...state, shake: false };
      
    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    case 'RESET_GAME':
      return { ...initialState, language: state.language };

    default:
      return state;
  }
}

// 4. The new hook that components will use
export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const newGame = useCallback(async (options: { gameMode: GameMode; language: Language }) => {
    dispatch({ type: 'START_NEW_GAME', payload: options });
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new', language: options.language, gameMode: options.gameMode })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'failedToStart');
      dispatch({ type: 'NEW_GAME_SUCCESS', payload: { wordLength: data.length, firstLetter: data.firstLetter } });
      return { success: true, ...data };
    } catch (e) {
      // FIX: Removed the unused 'error' variable.
      const errorMessage = (e instanceof Error ? e.message : 'failedToStart') as TranslationKey;
      dispatch({ type: 'NEW_GAME_FAILURE', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  }, []);

  const submitGuess = useCallback(async () => {
    if (state.isSubmitting || state.gameOver) return;
    dispatch({ type: 'SUBMIT_GUESS' });
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: state.currentGuess, language: state.language, guessCount: state.guesses.length })
      });
      const data = await response.json();
      if (!data.isValid) {
        dispatch({ type: 'SUBMIT_FAILURE', payload: { messageKey: data.message || 'notInWordList' } });
        return;
      }
      dispatch({ 
        type: 'SUBMIT_SUCCESS', 
        payload: { 
          newGuess: { word: state.currentGuess, letterStates: data.letterStates, isCorrect: data.isCorrect },
          isGameOver: data.isGameOver,
          answer: data.answer
        }
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      dispatch({ type: 'SUBMIT_FAILURE', payload: { messageKey: 'error' } });
    }
  }, [state.currentGuess, state.language, state.guesses.length, state.isSubmitting, state.gameOver]);

  const updateCurrentGuess = useCallback((newGuess: string) => {
    dispatch({ type: 'UPDATE_CURRENT_GUESS', payload: { newGuess } });
  }, []);
  
  const loadInProgressGame = useCallback((savedState: { guesses: GuessResult[], revealedAnswer: string | null }, wordInfo: { wordLength: number, firstLetter: string }) => {
    dispatch({ type: 'LOAD_IN_PROGRESS_GAME', payload: { ...savedState, ...wordInfo } });
  }, []);

  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);
  const resetShake = useCallback(() => dispatch({ type: 'RESET_SHAKE' }), []);
  const clearToast = useCallback(() => dispatch({ type: 'CLEAR_TOAST' }), []);

  return { state, newGame, submitGuess, updateCurrentGuess, loadInProgressGame, resetGame, resetShake, clearToast };
}