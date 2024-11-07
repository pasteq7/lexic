'use client';

import { useState, useMemo } from 'react';
import {  AnimatePresence } from 'framer-motion';
import { MainMenu } from '@/components/layout/MainMenu';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameState } from '@/lib/hooks/useGameState';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardControls } from '@/lib/hooks/useKeyboardControls';
import { 
  TRIES, 
  createInitialStats, 
  updateGameStats, 
  type Language,
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
import { HomeButton } from '@/components/ui/HomeButton';
import { Card } from '../ui/card';

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
  const [letterStates, setLetterStates] = useState<Record<string, string>>({});

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
    if (currentGuess.length !== wordLength) {
      toast({
        title: "Error",
        description: `Word must be ${wordLength} letters`,
        duration: 2000
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const result = await submitGameGuess(currentGuess);
    
    if (!result.isValid) {
      toast({
        title: "Error",
        description: result.message || 'Invalid word',
        duration: 2000
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLetterStates(prev => ({
      ...prev,
      ...result.letterStates
    }));

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
    keyboardLayout
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

  const shareResults = async () => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guesses })
      });
      const { text } = await response.json();
      
      navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: 'Results copied to clipboard!',
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to share results',
        duration: 2000
      });
    }
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

        {isPlaying && !showMenu && (
          <div className="w-full max-w-lg mx-auto px-4 relative z-20">
            <HomeButton onClick={handleHome} />
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col h-screen relative z-20">
        {isPlaying && wordLength > 0 && (
          <Card className="bg-transparent backdrop-blur-sm shadow-none border-none flex-1 flex items-center justify-center">
            <GameBoard
              guesses={guesses}
              currentGuess={currentGuess}
              wordLength={wordLength}
              shake={shake}
              showStats={showStats}
              stats={stats}
              gameOver={gameOver}
              keyStates={keyStates}
              language={language}
              onKeyPress={handleKeyPress}
              onHome={handleHome}
              onNewGame={() => {
                setShowStats(false);
                newGame();
              }}
              onShare={shareResults}
              keyboardLayout={keyboardLayout}
              revealedAnswer={revealedAnswer}
            />
          </Card>
        )}
      </div>
    </>
  );
}