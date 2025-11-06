// components/layout/Game.tsx - SIMPLIFIED & ROBUST
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MainMenu } from '@/components/layout/MainMenu';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameEngine } from '@/hooks/game/useGameEngine';
import { useGameStats } from '@/hooks/stats/useGameStats';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import { Card } from '../ui/card';
import { t } from '@/lib/i18n/translations';
import { Language } from '@/lib/types/i18n';
import { GameMode, LetterState } from '@/lib/types/game';
import {
  loadDailyGameState,
  saveDailyGameState,
  loadLanguagePreference,
  saveLanguagePreference,
  loadGameState,
  saveGameState
} from '@/lib/utils/storage';
import { KeyboardLayout } from '@/lib/types/keyboard';
import { getKeyboardState } from '@/lib/utils/keyboard';

export function Game() {
  // UI State
  const [showMenu, setShowMenu] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReviewCard, setShowReviewCard] = useState(false);

  // Settings
  const [language, setLanguage] = useState<Language>(() => loadLanguagePreference());
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() => {
    const saved = loadGameState<KeyboardLayout | null>('keyboardLayout', null);
    return saved || (language === 'fr' ? 'azerty' : 'qwerty');
  });

  // Game Engine
  const {
    state,
    newGame,
    submitGuess,
    updateCurrentGuess,
    loadInProgressGame,
    resetGame,
    clearToast
  } = useGameEngine();

  const { toast } = useToast();
  const { stats, updateGameResult } = useGameStats({
    gameMode: state.gameMode,
    language: state.language
  });

  // Compute keyboard states from guesses
  const keyStates = useMemo(() =>
    getKeyboardState(state.guesses),
    [state.guesses]
  );

  // Compute initial board states (first letter locked)
  const initialBoardStates: LetterState[] = useMemo(() => {
    if (state.wordLength === 0) return [];
    const states = Array(state.wordLength).fill('empty');
    if (!state.gameOver && state.firstLetter) {
      states[0] = 'correct';
    }
    return states;
  }, [state.wordLength, state.gameOver, state.firstLetter]);

  // Handle language change
  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    saveLanguagePreference(newLang);

    // Auto-switch keyboard layout if user hasn't manually set one
    const userLayout = loadGameState<KeyboardLayout | null>('keyboardLayout', null);
    if (!userLayout) {
      setKeyboardLayout(newLang === 'fr' ? 'azerty' : 'qwerty');
    }
  }, []);

  // Handle keyboard layout change
  const handleKeyboardLayoutChange = useCallback((layout: KeyboardLayout) => {
    setKeyboardLayout(layout);
    saveGameState('keyboardLayout', layout);
  }, []);

  // Start a new game
  const handleStartGame = useCallback(async (mode: GameMode) => {
    setShowReviewCard(false);
    setShowMenu(false);
    setIsPlaying(true);

    const result = await newGame({ gameMode: mode, language });

    if (result.success) {
      // Check for saved progress in daily modes
      if (mode === 'wordOfTheDay' || mode === 'todaysSet') {
        const savedState = loadDailyGameState(mode, language);
        if (savedState) {
          loadInProgressGame(savedState, {
            wordLength: result.length,
            firstLetter: result.firstLetter
          });
        }
      }
    }
  }, [newGame, language, loadInProgressGame]);

  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    // Special case: Enter on game over in infinite mode starts new game
    if (state.gameOver && key.toLowerCase() === 'enter' && state.gameMode === 'infinite') {
      handleStartGame(state.gameMode);
      return;
    }

    // Don't process keys if not playing or during submission
    if (!isPlaying || state.isSubmitting || state.isLoading) return;

    const normalizedKey = key.toLowerCase();

    switch (normalizedKey) {
      case 'enter':
        if (state.currentGuess.length === state.wordLength) {
          submitGuess();
        }
        break;

      case 'backspace':
        // Prevent deleting first letter
        if (state.currentGuess.length > state.firstLetter.length) {
          updateCurrentGuess(state.currentGuess.slice(0, -1));
        }
        break;

      default:
        // Only accept valid letters
        if (
          key.length === 1 &&
          /^[a-zàâäéèêëîïôöùûüÿçæœ]$/i.test(key) &&
          state.currentGuess.length < state.wordLength
        ) {
          updateCurrentGuess(state.currentGuess + normalizedKey);
        }
        break;
    }
  }, [
    state.gameOver,
    state.gameMode,
    state.isSubmitting,
    state.isLoading,
    state.currentGuess,
    state.wordLength,
    state.firstLetter,
    isPlaying,
    handleStartGame,
    submitGuess,
    updateCurrentGuess
  ]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlaying) return;
      handleKeyPress(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleKeyPress]);

  // Handle toast notifications
  useEffect(() => {
    if (state.toast) {
      toast({
        title: t(state.toast.messageKey, language, state.toast.params),
        variant: state.toast.type,
        duration: 2000,
      });
      clearToast();
    }
  }, [state.toast, language, toast, clearToast]);

  // Handle game over
  useEffect(() => {
    if (state.gameOver && state.revealedAnswer) {
      const isWon = state.guesses.length > 0 &&
                    state.guesses[state.guesses.length - 1].isCorrect;

      // **FIX: Update stats on game over**
      updateGameResult({
        won: isWon,
        numGuesses: state.guesses.length,
        word: state.revealedAnswer,
        timestamp: Date.now()
      });

      // Show toast
      if (isWon) {
        toast({
          title: t('youWon', language),
          variant: 'success',
          duration: 4000,
        });
      } else {
        toast({
          title: t('gameOver', language),
          description: t('answer', language, { word: state.revealedAnswer }),
          variant: 'destructive',
          duration: 5000,
        });
      }

      // Show stats after delay
      setTimeout(() => {
        setShowReviewCard(true);
      }, 1500);
    }
  }, [state.gameOver, state.revealedAnswer, state.guesses, language, toast, updateGameResult]);

  // Auto-save daily game progress
  useEffect(() => {
    if (
      isPlaying &&
      !state.gameOver &&
      state.guesses.length > 0 &&
      (state.gameMode === 'wordOfTheDay' || state.gameMode === 'todaysSet')
    ) {
      saveDailyGameState(state.gameMode, language, {
        guesses: state.guesses,
        revealedAnswer: state.revealedAnswer
      });
    }
  }, [state.guesses, state.gameOver, state.gameMode, language, isPlaying, state.revealedAnswer]);

  // Handle home button
  const handleHome = useCallback(() => {
    setShowMenu(true);
    setIsPlaying(false);
    setShowReviewCard(false);
    resetGame();
  }, [resetGame]);

  return (
    <>
      <AnimatePresence>
        {showMenu && (
          <MainMenu
            selectedLanguage={language}
            onLanguageChange={handleLanguageChange}
            onStartGame={handleStartGame}
            keyboardLayout={keyboardLayout}
            onKeyboardLayoutChange={handleKeyboardLayoutChange}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen relative z-20">
        {isPlaying && !showMenu && (
          <div className="h-14 sm:h-20">
            <Button
              variant="outline"
              onClick={handleHome}
              className="absolute top-2 sm:top-6 left-1/2 -translate-x-1/2 z-10"
            >
              <Home className="mr-2 h-4 w-4" />
              {t('home', language)}
            </Button>
          </div>
        )}

        {isPlaying && (
          <Card className="bg-transparent backdrop-blur-xs shadow-none border-none flex-1 flex items-center justify-center mx-auto max-w-2xl px-4">
            <GameBoard
              guesses={state.guesses}
              currentGuess={state.currentGuess}
              wordLength={state.wordLength}
              shake={state.shake}
              showStats={showReviewCard}
              stats={stats}
              gameOver={state.gameOver}
              keyStates={keyStates}
              onKeyPress={handleKeyPress}
              onNewGame={() => handleStartGame(state.gameMode)}
              keyboardLayout={keyboardLayout}
              revealedAnswer={state.revealedAnswer}
              language={language}
              isSubmitting={state.isSubmitting}
              isLoading={state.isLoading}
              gameMode={state.gameMode}
              initialStates={initialBoardStates}
            />
          </Card>
        )}
      </div>
    </>
  );
}