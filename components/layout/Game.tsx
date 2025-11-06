// components/layout/Game.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MainMenu } from '@/components/layout/MainMenu';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameEngine } from '@/hooks/game/useGameEngine';
import { useGameEffects } from '@/hooks/game/useGameEffects';
import { useGameStats } from '@/hooks/stats/useGameStats';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import { Card } from '../ui/card';
import { t } from '@/lib/i18n/translations';
import { Language } from '@/lib/types/i18n';
import { GameMode, LetterState } from '@/lib/types/game';
import { loadGameState, saveGameState, saveDailyGameState, loadDailyGameState, loadLanguagePreference, saveLanguagePreference } from '@/lib/utils/storage';
import { KeyboardLayout, KeyState } from '@/lib/types/keyboard';
import { getKeyboardState } from '@/lib/utils/keyboard';

export function Game() {
  const [showMenu, setShowMenu] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReviewCard, setShowReviewCard] = useState(false);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  
  const { state, newGame, submitGuess, updateCurrentGuess, loadInProgressGame, resetGame, resetShake, clearToast } = useGameEngine();
  const { language, gameMode, guesses, gameOver, revealedAnswer } = state;

  const { toast } = useToast();
  const { stats } = useGameStats({ gameMode, language });

  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() => {
    const saved = loadGameState<KeyboardLayout | null>('keyboardLayout', null);
    if (saved) return saved;
    return loadLanguagePreference() === 'fr' ? 'azerty' : 'qwerty';
  });

  const handleStartGame = useCallback(async (mode: GameMode) => {
    setShowReviewCard(false);
    setShowMenu(false);
    setIsPlaying(true);
    
    const savedState = loadDailyGameState(mode, language);
    const result = await newGame({ gameMode: mode, language });
    
    if (result.success && savedState) {
        loadInProgressGame(savedState, { wordLength: result.length, firstLetter: result.firstLetter });
    }
  }, [newGame, language, loadInProgressGame]);

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

  useEffect(() => {
    if (state.shake) {
      const timer = setTimeout(() => resetShake(), 600);
      return () => clearTimeout(timer);
    }
  }, [state.shake, resetShake]);
  
  const handleKeyPress = useCallback((key: string) => {
    if (gameOver && key.toLowerCase() === 'enter' && gameMode === 'infinite') {
      handleStartGame(gameMode);
      return;
    }

    if (!isPlaying || state.isSubmitting || state.isLoading) return;

    switch (key.toLowerCase()) {
      case 'enter':
        if (state.currentGuess.length === state.wordLength) {
          submitGuess();
        }
        break;
      case 'backspace':
        updateCurrentGuess(state.currentGuess.slice(0, -1));
        break;
      default:
        if (
          key.length === 1 && 
          /^[a-zàâäéèêëîïôöùûüÿçæœ]$/i.test(key) && 
          state.currentGuess.length < state.wordLength
        ) {
          updateCurrentGuess(state.currentGuess + key.toLowerCase());
        }
        break;
    }
  }, [
    gameOver, gameMode, isPlaying, state.isSubmitting, state.isLoading, state.currentGuess, 
    state.wordLength, handleStartGame, submitGuess, updateCurrentGuess
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => handleKeyPress(event.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  useGameEffects({
    gameOver,
    guesses,
    revealedAnswer,
    onShowStats: setShowReviewCard,
    gameMode,
    language,
    toast,
  });

  const handleLanguageChange = (newLang: Language) => {
    // This is managed by the engine now, but we need a way to set it from the menu
    // A simple solution is to just update the preference and let the engine pick it up on next game start.
    saveLanguagePreference(newLang);
    // For immediate UI update in the menu, we can still hold a local state for it
    if (!userSavedLayout) {
      setKeyboardLayout(newLang === 'fr' ? 'azerty' : 'qwerty');
    }
  };

  const handleHome = () => {
    if (isPlaying && !gameOver && (gameMode === 'wordOfTheDay' || gameMode === 'todaysSet')) {
      saveDailyGameState(gameMode, language, { guesses, revealedAnswer });
    }
    setShowMenu(true);
    setIsPlaying(false);
    resetGame();
  };

  const handleKeyboardLayoutChange = (layout: KeyboardLayout) => {
    setKeyboardLayout(layout);
    saveGameState('keyboardLayout', layout);
  };
  
  const userSavedLayout = loadGameState<KeyboardLayout | null>('keyboardLayout', null);
  
  useEffect(() => {
    setKeyStates(getKeyboardState(guesses));
  }, [guesses]);

  const initialBoardStates: LetterState[] = Array(state.wordLength).fill('empty');
  if (state.wordLength > 0 && !gameOver) {
      initialBoardStates[0] = 'correct';
  }

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
              guesses={guesses}
              currentGuess={state.currentGuess}
              wordLength={state.wordLength}
              shake={state.shake}
              showStats={showReviewCard}
              stats={stats}
              gameOver={gameOver}
              keyStates={keyStates}
              onKeyPress={handleKeyPress}
              onNewGame={() => handleStartGame(gameMode)}
              keyboardLayout={keyboardLayout}
              revealedAnswer={revealedAnswer}
              language={language}
              isSubmitting={state.isSubmitting}
              isLoading={state.isLoading}
              gameMode={gameMode}
              initialStates={initialBoardStates}
            />
          </Card>
        )}
      </div>
    </>
  );
}