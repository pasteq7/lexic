'use client';

import { useState, useMemo } from 'react';
import {  AnimatePresence } from 'framer-motion';
import { MainMenu } from '@/components/layout/MainMenu';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameState } from '@/hooks/useGameState';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { 
  TRIES, 
  createInitialStats, 
  updateGameStats, 
  saveLanguagePreference,
  getLanguagePreference,
  LetterState,
} from '@/lib/words';
import { 
  loadGameState,
  getKeyboardState,
  KeyboardLayout,
  saveGameState,
} from '@/lib/utils';
import { Button } from "@/components/ui/button"
import { Home } from 'lucide-react';
import { Card } from '../ui/card';
import { t, TranslationKey, Language } from '@/lib/translations';

export function Game() {
  const [showStats, setShowStats] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [language, setLanguage] = useState<Language>(() => getLanguagePreference());
  const [shake, setShake] = useState(false);
  const [stats, setStats] = useState(() => loadGameState('stats', createInitialStats()));
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>(() => 
    loadGameState('keyboardLayout', 'qwerty')
  );

  const {
    wordLength,
    guesses,
    currentGuess,
    gameOver,
    setGuesses,
    setCurrentGuess,
    setGameOver,
    newGame,
    submitGuess: submitGameGuess,
    revealedAnswer,
    isSubmitting,
  } = useGameState(language);

  const { toast } = useToast();
  const keyStates = useMemo(() => {
    return getKeyboardState(
      guesses.map(g => g.word),
      guesses.reduce((acc, g, index) => {
        acc[index] = g.letterStates;
        return acc;
      }, {} as Record<number, LetterState[]>)
    );
  }, [guesses]);

  const handleSubmitGuess = async () => {
    if (isSubmitting) {
      return;
    }

    if (currentGuess.length !== wordLength) {
      toast({
        title: "Error",
        description: t('wordLength', language, { length: wordLength }),
        duration: 2000
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const result = await submitGameGuess(currentGuess);
    
    if (!result.isValid) {
      toast({
        title: t('error', language),
        description: result.message ? t(result.message as TranslationKey, language) : t('invalidWord', language),
        duration: 2000
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (result.isCorrect) {
      handleGameEnd(true, result.guessCount || 0);
    } else if (guesses.length >= TRIES - 1) {
      handleGameEnd(false, TRIES);
    }
  };

  const { handleKeyPress } = useKeyboardControls({
    isPlaying,
    gameOver,
    currentGuess,
    wordLength,
    onSubmit: handleSubmitGuess,
    onUpdateGuess: setCurrentGuess,
    keyboardLayout,
    isSubmitting
  });

  const handleGameEnd = (won: boolean, guessCount: number) => {
    setGameOver(true);
    setShowStats(true);
    setStats(prev => updateGameStats(prev, won, guessCount));
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    saveLanguagePreference(newLang);
  };


  const handleStartGame = async () => {
    try {
      setShowMenu(false);
      setShowStats(false);
      setIsPlaying(false);
      
      // Reset game state
      setGuesses([]);
      setCurrentGuess('');
      setGameOver(false);
      
      const result = await newGame();
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || 'Failed to start game',
          duration: 2000
        });
        setShowMenu(true);
      } else {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Start game error:', error);
      toast({
        title: "Error",
        description: 'Failed to start game',
        duration: 2000
      });
      setShowMenu(true);
    }
  };

  const handleHome = () => {
    setShowMenu(true);
    setIsPlaying(false);
    setShowStats(false);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
  };

  const handleKeyboardLayoutChange = (layout: KeyboardLayout) => {
    setKeyboardLayout(layout);
    saveGameState('keyboardLayout', layout);
  };

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

      <div className="flex flex-col min-h-screen relative z-20 mt-8">
        {isPlaying && !showMenu && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <Button
              variant="outline"
              onClick={handleHome}
              className="mb-6"
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
              shake={shake}
              showStats={showStats}
              stats={stats}
              gameOver={gameOver}
              keyStates={keyStates}
              onKeyPress={handleKeyPress}
              onNewGame={() => {
                setShowStats(false);
                newGame();
              }}
              keyboardLayout={keyboardLayout}
              revealedAnswer={revealedAnswer}
              language={language}
            />
          </Card>
        )}
      </div>
    </>
  );
}