// components/layout/MainMenu.tsx - FIXED VERSION
'use client';

import { motion } from 'framer-motion';
import { KeyboardLayout } from '@/lib/types/keyboard';
import { Language } from '@/lib/types/i18n';
import { GameMode, GameStats } from '@/lib/types/game';
import { Book, Settings, BarChart, Infinity, Calendar, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LanguageFlag } from '@/components/ui/LanguageFlag';
import { Button } from "@/components/ui/button";
import { SettingsDialog } from '@/components/ui/SettingsDialog';
import { Title } from '@/components/ui/Title';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { t } from '@/lib/i18n/translations';
import { useGameStats } from '@/hooks/stats/useGameStats';
import { MENU_ANIMATIONS } from '@/lib/utils/animations';
import { DetailedStats } from '@/components/stats/DetailedStats';

interface MainMenuProps {
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onStartGame: (gameMode: GameMode) => void;
  keyboardLayout: KeyboardLayout;
  onKeyboardLayoutChange: (layout: KeyboardLayout) => void;
}

/**
 * Check if a daily challenge was completed today
 * Uses UTC day comparison to be consistent across timezones
 */
const isCompletedToday = (stats: GameStats) => {
  if (!stats || !stats.lastCompleted) return false;
  
  const now = new Date();
  const lastCompletion = new Date(stats.lastCompleted);
  
  // Compare UTC dates
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const lastCompletionUTC = Date.UTC(
    lastCompletion.getUTCFullYear(), 
    lastCompletion.getUTCMonth(), 
    lastCompletion.getUTCDate()
  );
  
  return todayUTC === lastCompletionUTC;
};

export function MainMenu({ 
  selectedLanguage, 
  onLanguageChange, 
  onStartGame, 
  keyboardLayout, 
  onKeyboardLayoutChange 
}: MainMenuProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const { stats: infiniteStats } = useGameStats({ gameMode: 'infinite', language: selectedLanguage });
  const { stats: wordOfTheDayStats } = useGameStats({ gameMode: 'wordOfTheDay', language: selectedLanguage });
  const { stats: todaysSetStats } = useGameStats({ gameMode: 'todaysSet', language: selectedLanguage });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      // Set target to next day at 00:00:00 UTC
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      
      const diff = tomorrow.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');

      setTimeRemaining(`${hours}:${minutes}:${seconds}`);
    };

    calculateTimeRemaining();
    const timerId = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timerId);
  }, []);

  const toggleLanguage = () => onLanguageChange(selectedLanguage === 'en' ? 'fr' : 'en');

  // Check if daily challenges are completed (win OR loss counts as completed)
  const wordOfTheDayCompleted = isCompletedToday(wordOfTheDayStats);
  const todaysSetCompleted = isCompletedToday(todaysSetStats);

  const buttonHoverAnimation = {
    y: -5,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    transition: { type: "spring", stiffness: 300, damping: 15 }
  };

  return (
    <motion.div
      {...MENU_ANIMATIONS.CONTAINER}
      className="fixed inset-0 flex items-center justify-center z-30"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-4 sm:px-8 py-8 max-w-md w-full mx-auto flex flex-col gap-8 justify-center"
      >
        <Title />
        
        <div className="space-y-4">
          <motion.div whileHover={!wordOfTheDayCompleted ? buttonHoverAnimation : {}}>
            <Button
              variant={wordOfTheDayCompleted ? "outline" : "default"}
              size="lg"
              className="w-full py-7 sm:py-8 text-lg sm:text-xl justify-between group"
              onClick={() => onStartGame('wordOfTheDay')}
              disabled={wordOfTheDayCompleted}
            >
              <span className="flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                <span>{t('wordOfTheDay', selectedLanguage)}</span>
              </span>
              <span className="flex items-center gap-2">
                {wordOfTheDayCompleted ? (
                  <span className="text-sm font-mono tabular-nums tracking-widest">{timeRemaining}</span>
                ) : (
                  <span className="px-3 py-1.5 rounded border-2 border-dashed border-accent">
                    {wordOfTheDayStats.currentStreak}
                  </span>
                )}
              </span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={!todaysSetCompleted ? buttonHoverAnimation : {}}>
            <Button
              variant={todaysSetCompleted ? "outline" : "default"}
              size="lg"
              className="w-full py-7 sm:py-8 text-lg sm:text-xl justify-between group"
              onClick={() => onStartGame('todaysSet')}
              disabled={todaysSetCompleted}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                <span>{t('todaysSet', selectedLanguage)}</span>
              </span>
              <span className="flex items-center gap-2">
                {todaysSetCompleted ? (
                  <span className="text-sm font-mono tabular-nums tracking-widest">{timeRemaining}</span>
                ) : (
                  <span className="px-3 py-1.5 rounded border-2 border-dashed border-accent">
                    {todaysSetStats.currentStreak}
                  </span>
                )}
              </span>
            </Button>
          </motion.div>
          
          <motion.div whileHover={buttonHoverAnimation}>
            <Button 
              variant="default" 
              size="lg"
              className="w-full py-7 sm:py-8 text-lg sm:text-xl justify-start group"
              onClick={() => onStartGame('infinite')}
            >
              <span className="flex items-center gap-3">
                <Infinity className="h-6 w-6" />
                <span>{t('infinite', selectedLanguage)}</span>
              </span>
            </Button>
          </motion.div>
        </div>

        {/* Menu buttons */}
        <div className="flex justify-center gap-3 sm:gap-4">
          <motion.div {...MENU_ANIMATIONS.BUTTON_EXTRA}>
            <Button 
              variant="default" 
              size="icon" 
              className="h-14 w-14 sm:h-16 sm:w-16 relative group" 
              onClick={toggleLanguage} 
              aria-label={`Switch to ${selectedLanguage === 'en' ? 'French' : 'English'}`}
            >
              <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
                <LanguageFlag language={selectedLanguage} size={28}/>
              </div>
            </Button>
          </motion.div>
          <motion.div {...MENU_ANIMATIONS.BUTTON_EXTRA}>
            <Button variant="default" size="icon" className="h-14 w-14 sm:h-16 sm:w-16 p-2" onClick={() => setShowHelp(true)}>
              <Book size={24} />
            </Button>
          </motion.div>
          <motion.div {...MENU_ANIMATIONS.BUTTON_EXTRA}>
            <Button variant="default" size="icon" className="h-14 w-14 sm:h-16 sm:w-16 p-2" onClick={() => setShowStats(true)}>
              <BarChart size={24} />
            </Button>
          </motion.div>
          <motion.div {...MENU_ANIMATIONS.BUTTON_EXTRA}>
            <Button variant="default" size="icon" className="h-14 w-14 sm:h-16 sm:w-16 p-2" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={24} />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-4">{t('howToPlay', selectedLanguage)}</DialogTitle>
            <DialogDescription className="space-y-4 text-primary leading-relaxed">
              {t('gameRules', selectedLanguage).split('\n').map((rule, index) => (
                <p key={index}>{rule}</p>
              ))}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onClearStorage={() => { localStorage.clear(); window.location.reload(); }} 
        keyboardLayout={keyboardLayout} 
        onKeyboardLayoutChange={onKeyboardLayoutChange} 
        language={selectedLanguage}
      />
      
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-4">{t('statistics', selectedLanguage)}</DialogTitle>
          </DialogHeader>
          <DetailedStats 
            allStats={{ 
              infinite: infiniteStats, 
              wordOfTheDay: wordOfTheDayStats, 
              todaysSet: todaysSetStats 
            }} 
            language={selectedLanguage} 
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}