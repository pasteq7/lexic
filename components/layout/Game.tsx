'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MainMenu } from '@/components/layout/MainMenu';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameLogic } from '@/hooks/game/useGameLogic';
import { useGameEffects } from '@/hooks/game/useGameEffects';
import { useGameStats } from '@/hooks/stats/useGameStats';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import { Card } from '../ui/card';
import { t } from '@/lib/i18n/translations';
import { Language, TranslationKey } from '@/lib/types/i18n';
import { GameMode, LetterState } from '@/lib/types/game';
import { loadGameState, saveGameState, saveDailyGameState, loadDailyGameState, clearDailyGameState, loadLanguagePreference, saveLanguagePreference } from '@/lib/utils/storage';
import { KeyboardLayout, KeyState } from '@/lib/types/keyboard';
import { getKeyboardState } from '@/lib/utils/keyboard';

export function Game() {
  const [showMenu, setShowMenu] = useState(true);
  const [language, setLanguage] = useState<Language>(() => loadLanguagePreference());
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('infinite');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() => {
    const userSavedLayout = loadGameState<KeyboardLayout | null>('keyboardLayout', null);
    if (userSavedLayout) return userSavedLayout;
    const initialLanguage = loadLanguagePreference();
    return initialLanguage === 'fr' ? 'azerty' : 'qwerty';
  });
  const [shake, setShake] = useState(false);
  const [showReviewCard, setShowReviewCard] = useState(false);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { toast } = useToast();
  const { stats } = useGameStats({ gameMode, language });

  const {
    wordLength,
    guesses,
    currentGuess,
    gameOver,
    isSubmitting,
    isLoading,
    revealedAnswer,
    submitGuess,
    updateCurrentGuess,
    newGame,
    resetGame,
    loadInProgressGame,
  } = useGameLogic({ 
    language,
    onFirstLetterDeleteAttempt: () => {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  });

  const handleStartGame = useCallback(async (mode: GameMode) => {
    setGameMode(mode);
    setShowReviewCard(false);
    setShowMenu(false);
    setIsPlaying(true);
    
    const isDailyMode = mode === 'wordOfTheDay' || mode === 'todaysSet';

    if (isDailyMode) {
      const savedState = loadDailyGameState(mode, language);
      const today = new Date().toDateString();

      if (savedState && savedState.date === today) {
        const result = await newGame({ gameMode: mode });
        if (result.success) {
          loadInProgressGame(savedState);
        } else {
          toast({
            title: t('error', language),
            description: result.error || t('failedToStart', language),
            duration: 2000
          });
        }
        return;
      } else if (savedState) {
        clearDailyGameState(mode, language);
      }
    }

    const result = await newGame({ gameMode: mode });
    if (!result.success) {
      toast({
        title: t('error', language),
        description: result.error || t('failedToStart', language),
        duration: 2000
      });
    }
  }, [newGame, language, toast, loadInProgressGame]);

  useEffect(() => {
    if (!isInitialLoad) return;

    const attemptResume = async () => {
        const today = new Date().toDateString();
        const wotdState = loadDailyGameState('wordOfTheDay', language);
        if (wotdState && wotdState.date === today && !wotdState.revealedAnswer) {
            await handleStartGame('wordOfTheDay');
            return;
        }

        const todaysSetState = loadDailyGameState('todaysSet', language);
        if (todaysSetState && todaysSetState.date === today && !todaysSetState.revealedAnswer) {
            await handleStartGame('todaysSet');
        }
    };

    attemptResume().finally(() => {
        setIsInitialLoad(false);
    });
  }, [isInitialLoad, language, handleStartGame]);

  const handleSubmitGuess = useCallback(async () => {
    const result = await submitGuess(currentGuess);
    if (!result.isValid && result.message) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast({
        title: t(result.message as TranslationKey, language),
        description: result.message === 'wordLength' ? t('wordLength', language, { length: wordLength }) : undefined,
        duration: 2000,
        variant: 'destructive'
      });
    }
  }, [submitGuess, currentGuess, language, toast, wordLength]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver && key.toLowerCase() === 'enter' && gameMode === 'infinite') {
      handleStartGame(gameMode);
      return;
    }

    if (!isPlaying || isSubmitting || isLoading) return;

    switch (key.toLowerCase()) {
      case 'enter':
        if (currentGuess.length === wordLength) {
          handleSubmitGuess();
        }
        break;
      case 'backspace':
        updateCurrentGuess(currentGuess.slice(0, -1));
        break;
      default:
        if (
          key.length === 1 && 
          /^[a-zàâäéèêëîïôöùûüÿçæœ]$/i.test(key) && 
          currentGuess.length < wordLength
        ) {
          updateCurrentGuess(currentGuess + key.toLowerCase());
        }
        break;
    }
  }, [
    gameOver,
    handleStartGame,
    isPlaying,
    isSubmitting,
    currentGuess,
    wordLength,
    handleSubmitGuess,
    updateCurrentGuess,
    gameMode,
    isLoading
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyPress(event.key);
    };

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
    setLanguage(newLang);
    saveLanguagePreference(newLang);
    
    const userSavedLayout = loadGameState<KeyboardLayout | null>('keyboardLayout', null);
    if (!userSavedLayout) {
      setKeyboardLayout(newLang === 'fr' ? 'azerty' : 'qwerty');
    }
  };

  const handleHome = () => {
    const isDailyMode = gameMode === 'wordOfTheDay' || gameMode === 'todaysSet';
    if (isPlaying && isDailyMode && !gameOver) {
      saveDailyGameState(gameMode, language, {
        date: new Date().toDateString(),
        guesses: guesses,
        revealedAnswer: revealedAnswer,
      });
    }
    setShowMenu(true);
    setIsPlaying(false);
    resetGame();
  };

  const handleKeyboardLayoutChange = (layout: KeyboardLayout) => {
    setKeyboardLayout(layout);
    saveGameState('keyboardLayout', layout);
  };

  useEffect(() => {
    const newKeyStates = getKeyboardState(guesses);
    setKeyStates(newKeyStates);
  }, [guesses]);

  const initialBoardStates: LetterState[] = Array(wordLength).fill('empty');
  if (wordLength > 0 && !gameOver) {
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
              currentGuess={currentGuess}
              wordLength={wordLength}
              showStats={showReviewCard}
              gameOver={gameOver}
              onKeyPress={handleKeyPress}
              onNewGame={() => handleStartGame(gameMode)}
              keyboardLayout={keyboardLayout}
              revealedAnswer={revealedAnswer}
              language={language}
              shake={shake}
              keyStates={keyStates}
              stats={stats}
              isSubmitting={isSubmitting}
              isLoading={isLoading}
              gameMode={gameMode}
              initialStates={initialBoardStates}
            />
          </Card>
        )}
      </div>
    </>
  );
}