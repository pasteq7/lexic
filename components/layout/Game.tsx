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
import { loadGameState, saveGameState } from '@/lib/utils/storage';
import { KeyboardLayout, KeyState } from '@/lib/types/keyboard';
import { getKeyboardState } from '@/lib/utils/keyboard';
import { saveLanguagePreference } from '@/lib/utils/storage';


export function Game() {
  const [showMenu, setShowMenu] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() => 
    loadGameState('keyboardLayout', 'qwerty')
  );
  const [shake, setShake] = useState(false);
  const [showStatsCard, setShowStatsCard] = useState(false);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});

  const { toast } = useToast();
  const { stats } = useGameStats();

  const {
    wordLength,
    guesses,
    currentGuess,
    gameOver,
    isSubmitting,
    revealedAnswer,
    submitGuess,
    updateCurrentGuess,
    newGame,
    resetGame,
  } = useGameLogic({ language });

  const handleStartGame = useCallback(async () => {
    setShowStatsCard(false);
    setShowMenu(false);
    setIsPlaying(true);
    const result = await newGame();
    if (!result.success) {
      toast({
        title: t('error', language),
        description: result.error || t('failedToStart', language),
        duration: 2000
      });
    }
  }, [newGame, language, toast]);

  const handleSubmitGuess = useCallback(async () => {
    const result = await submitGuess(currentGuess);
    if (!result.isValid && result.message) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast({
        title: t('error', language),
        description: t(result.message as TranslationKey, language),
        duration: 2000
      });
    }
  }, [submitGuess, currentGuess, language, toast]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver && key.toLowerCase() === 'enter') {
      handleStartGame();
      return;
    }

    if (!isPlaying || isSubmitting) return;

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
    updateCurrentGuess
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver && event.key === 'Enter') {
        event.preventDefault();
        handleStartGame();
        return;
      }

      if (!isPlaying) return;

      const key = event.key;
      if (key === 'Enter' || key === 'Backspace' || /^[a-zàâäéèêëîïôöùûüÿçæœ]$/i.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, handleStartGame, isPlaying, handleKeyPress]);

  useGameEffects({
    gameOver,
    guesses,
    revealedAnswer,
    onShowStats: setShowStatsCard
  });

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    saveLanguagePreference(newLang);
  };

  const handleHome = () => {
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
        
        {isPlaying && wordLength > 0 && (
          <Card className="bg-transparent backdrop-blur-sm shadow-none border-none flex-1 flex items-center justify-center mx-auto max-w-2xl px-4">
            <GameBoard
              guesses={guesses}
              currentGuess={currentGuess}
              wordLength={wordLength}
              showStats={showStatsCard}
              gameOver={gameOver}
              onKeyPress={handleKeyPress}
              onNewGame={handleStartGame}
              keyboardLayout={keyboardLayout}
              revealedAnswer={revealedAnswer}
              language={language}
              shake={shake}
              keyStates={keyStates}
              stats={stats}
              isSubmitting={isSubmitting}
            />
          </Card>
        )}
      </div>
    </>
  );
}