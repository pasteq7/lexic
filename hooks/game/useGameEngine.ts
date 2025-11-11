// hooks/game/useGameEngine.ts
import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameMode, GuessResult } from '@/lib/types/game';
import { saveDailyGameState, loadDailyGameState } from '@/lib/utils/storage';
import { Language } from '@/lib/types/i18n';
import { TRIES } from '@/lib/game/constants';
import { TranslationKey } from '@/lib/types/i18n';

export interface GameEngineState {
  wordLength: number;
  firstLetter: string;
  guesses: GuessResult[];
  currentGuess: string;
  gameOver: boolean;
  revealedAnswer: string | null;
  isSubmitting: boolean;
  isLoading: boolean;
  shake: boolean;
  toast: { messageKey: TranslationKey; params?: Record<string, string | number>; type: 'destructive' | 'success' | 'info'; } | null;
  gameMode: GameMode;
  language: Language;
  sessionId: string;
  lastActionTimestamp: number;
  // State for "Today's Set"
  todaysSetIndex: number;
  todaysSetTotal: number;
  todaysSetGuesses: number[]; // Tracks guess count for each completed word in the set
}

type GameAction =
  | { type: 'INIT_NEW_GAME'; payload: { gameMode: GameMode; language: Language; sessionId: string } }
  | { type: 'GAME_LOADED'; payload: { wordLength: number; firstLetter: string; todaysSetTotal?: number } }
  | { type: 'GAME_LOAD_FAILED'; payload: { error: TranslationKey } }
  | { type: 'UPDATE_GUESS'; payload: { guess: string } }
  | { type: 'START_SUBMIT' }
  | { type: 'SUBMIT_SUCCESS'; payload: { guess: GuessResult; isGameOver: boolean; answer?: string } }
  | { type: 'SUBMIT_FAILED'; payload: { messageKey: TranslationKey } }
  | { type: 'ADVANCE_TODAYS_SET'; payload: { nextWordInfo: { length: number; firstLetter: string }, previousGuessCount: number } }
  | { type: 'LOAD_SAVED_GAME'; payload: { guesses: GuessResult[]; revealedAnswer: string | null; wordLength: number; firstLetter: string; todaysSetIndex?: number; todaysSetGuesses?: number[]; } }
  | { type: 'CLEAR_SHAKE' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'RESET' };
  

const generateSessionId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialState: GameEngineState = {
  wordLength: 0,
  firstLetter: '',
  guesses: [],
  currentGuess: '',
  gameOver: false,
  revealedAnswer: null,
  isSubmitting: false,
  isLoading: false,
  shake: false,
  toast: null,
  gameMode: 'infinite',
  language: 'en',
  sessionId: generateSessionId(),
  lastActionTimestamp: Date.now(),
  todaysSetIndex: 0,
  todaysSetTotal: 0,
  todaysSetGuesses: [],
};

function gameReducer(state: GameEngineState, action: GameAction): GameEngineState {
  const timestamp = Date.now();
  
  switch (action.type) {
    case 'INIT_NEW_GAME':
      return { ...initialState, gameMode: action.payload.gameMode, language: action.payload.language, sessionId: action.payload.sessionId, isLoading: true, lastActionTimestamp: timestamp };
    case 'GAME_LOADED':
      return { ...state, wordLength: action.payload.wordLength, firstLetter: action.payload.firstLetter, currentGuess: action.payload.firstLetter, isLoading: false, todaysSetTotal: action.payload.todaysSetTotal || 0, lastActionTimestamp: timestamp };
    case 'GAME_LOAD_FAILED':
      return { ...state, isLoading: false, toast: { messageKey: action.payload.error, type: 'destructive' }, lastActionTimestamp: timestamp };
    case 'UPDATE_GUESS': {
      if (state.gameOver || state.isSubmitting) return state;
      const newGuess = action.payload.guess.toLowerCase();
      if (!newGuess.startsWith(state.firstLetter.toLowerCase()) || newGuess.length > state.wordLength) return state;
      return { ...state, currentGuess: newGuess, shake: false, lastActionTimestamp: timestamp };
    }
    case 'START_SUBMIT':
      return { ...state, isSubmitting: true, lastActionTimestamp: timestamp };
    case 'SUBMIT_SUCCESS': {
      const newGuesses = [...state.guesses, action.payload.guess];
      const isGameOver = action.payload.isGameOver;
      const revealedAnswer = action.payload.answer || state.revealedAnswer;

      if (state.gameMode === 'wordOfTheDay' || state.gameMode === 'todaysSet') {
        saveDailyGameState(state.gameMode, state.language, {
          guesses: newGuesses,
          revealedAnswer: isGameOver ? revealedAnswer : null,
          todaysSetIndex: state.todaysSetIndex,
          todaysSetGuesses: state.todaysSetGuesses,
        });
      }
      
      return { ...state, guesses: newGuesses, currentGuess: isGameOver ? '' : state.firstLetter, gameOver: isGameOver, revealedAnswer: revealedAnswer, isSubmitting: false, shake: false, lastActionTimestamp: timestamp };
    }
    case 'SUBMIT_FAILED':
      return { ...state, isSubmitting: false, shake: true, toast: { messageKey: action.payload.messageKey, type: 'destructive' }, lastActionTimestamp: timestamp };
    case 'ADVANCE_TODAYS_SET': {
      const { nextWordInfo, previousGuessCount } = action.payload;
      const newTodaysSetGuesses = [...state.todaysSetGuesses, previousGuessCount];

      saveDailyGameState(state.gameMode, state.language, {
        guesses: [],
        revealedAnswer: null,
        todaysSetIndex: state.todaysSetIndex + 1,
        todaysSetGuesses: newTodaysSetGuesses,
      });

      return {
        ...state,
        isSubmitting: false,
        todaysSetIndex: state.todaysSetIndex + 1,
        todaysSetGuesses: newTodaysSetGuesses,
        guesses: [], // Clear board for next word
        wordLength: nextWordInfo.length,
        firstLetter: nextWordInfo.firstLetter,
        currentGuess: nextWordInfo.firstLetter,
        lastActionTimestamp: timestamp,
      };
    }
    case 'LOAD_SAVED_GAME': {
      const isGameOver = !!action.payload.revealedAnswer || action.payload.guesses.length >= TRIES;
      return { ...state,
        guesses: action.payload.guesses,
        revealedAnswer: action.payload.revealedAnswer,
        wordLength: action.payload.wordLength,
        firstLetter: action.payload.firstLetter,
        currentGuess: isGameOver ? '' : action.payload.firstLetter,
        gameOver: isGameOver,
        isLoading: false,
        lastActionTimestamp: timestamp,
        todaysSetIndex: action.payload.todaysSetIndex ?? 0,
        todaysSetGuesses: action.payload.todaysSetGuesses ?? [],
      };
    }
    case 'CLEAR_SHAKE':
      return { ...state, shake: false };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    case 'RESET':
      return { ...initialState, language: state.language, sessionId: generateSessionId(), lastActionTimestamp: timestamp };
    default:
      return state;
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortControllerRef.current?.abort(); }, []);

  const newGame = useCallback(async (options: { gameMode: GameMode; language: Language }) => {
    abortControllerRef.current?.abort();
    const sessionId = generateSessionId();
    abortControllerRef.current = new AbortController();
    dispatch({ type: 'INIT_NEW_GAME', payload: { ...options, sessionId } });
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new', ...options, sessionId }),
        signal: abortControllerRef.current.signal,
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'failedToStart');
      const savedState = loadDailyGameState(options.gameMode, options.language);
      if (savedState) {
        dispatch({
          type: 'LOAD_SAVED_GAME',
          payload: {
            guesses: savedState.guesses,
            revealedAnswer: savedState.revealedAnswer,
            wordLength: data.length,
            firstLetter: data.firstLetter,
            todaysSetIndex: savedState.todaysSetIndex,
            todaysSetGuesses: savedState.todaysSetGuesses,
          }
        });
      } else {
        dispatch({ type: 'GAME_LOADED', payload: { wordLength: data.length, firstLetter: data.firstLetter, todaysSetTotal: data.todaysSetTotal } });
      }
      return { success: true, ...data };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return { success: false, error: 'cancelled' };
      const errorMessage = (error instanceof Error ? error.message : 'failedToStart') as TranslationKey;
      dispatch({ type: 'GAME_LOAD_FAILED', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  }, []);

  const submitGuess = useCallback(async () => {
    if (state.isSubmitting || state.gameOver || state.currentGuess.length !== state.wordLength) return;
    dispatch({ type: 'START_SUBMIT' });

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: state.currentGuess,
          language: state.language,
          guessCount: state.guesses.length,
          todaysSetIndex: state.todaysSetIndex,
        }),
      });
      const data = await response.json();

      if (!data.isValid) {
        dispatch({ type: 'SUBMIT_FAILED', payload: { messageKey: data.message || 'notInWordList' } });
        return;
      }

      const newGuess: GuessResult = { word: state.currentGuess, letterStates: data.letterStates, isCorrect: data.isCorrect };
      
      // Handle advancing in "Today's Set"
      if (data.isCorrect && state.gameMode === 'todaysSet' && !data.isLastWordInSet) {
        dispatch({
          type: 'ADVANCE_TODAYS_SET',
          payload: {
            nextWordInfo: data.nextWordInfo,
            previousGuessCount: state.guesses.length + 1,
          },
        });
        return;
      }

      // Handle game over conditions
      const isGameOver = (data.isCorrect && (state.gameMode !== 'todaysSet' || data.isLastWordInSet)) || (!data.isCorrect && state.guesses.length + 1 >= TRIES);
      
      dispatch({
        type: 'SUBMIT_SUCCESS',
        payload: {
          guess: newGuess,
          isGameOver: isGameOver,
          answer: data.answer,
        },
      });
    } catch (error) {
      console.error('Submit error:', error);
      dispatch({ type: 'SUBMIT_FAILED', payload: { messageKey: 'error' } });
    }
  }, [state]);

  const updateCurrentGuess = useCallback((newGuess: string) => dispatch({ type: 'UPDATE_GUESS', payload: { guess: newGuess } }), []);
  const loadInProgressGame = useCallback((savedState: { guesses: GuessResult[]; revealedAnswer: string | null }, wordInfo: { wordLength: number; firstLetter: string }) => {
    dispatch({ type: 'LOAD_SAVED_GAME', payload: { ...savedState, ...wordInfo } });
  }, []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), []);
  const clearToast = useCallback(() => dispatch({ type: 'CLEAR_TOAST' }), []);

  useEffect(() => {
    if (state.shake) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_SHAKE' }), 600);
      return () => clearTimeout(timer);
    }
  }, [state.shake]);

  return { state, newGame, submitGuess, updateCurrentGuess, loadInProgressGame, resetGame, clearToast };
}