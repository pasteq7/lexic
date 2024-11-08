import { GameStats, GuessResult } from '@/lib/types/game';
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Language } from '@/lib/types/i18n';
import { ANIMATIONS, STATS_ANIMATIONS } from '@/lib/utils/animations';

interface StatsCardProps {
  stats: GameStats;
  gameOver: boolean;
  guesses: GuessResult[];
  onNewGame: () => void;
  revealedAnswer?: string | null;
  language: Language;
  className?: string;
}

const Stats = React.memo(({ 
  label, 
  value, 
}: { 
  label: string; 
  value: number; 
  highlight?: boolean;
}) => (
  <motion.div 
    className={cn(
      "text-center p-4 rounded-lg",
    )}
    initial={STATS_ANIMATIONS.COUNT.initial}
    animate={STATS_ANIMATIONS.COUNT.animate}
    transition={STATS_ANIMATIONS.COUNT.transition}
  >
    <motion.div className="text-2xl font-bold text-primary">
      {Math.round(value)}
    </motion.div>
    <div className="text-sm text-primary/50">{label}</div>
  </motion.div>
));

Stats.displayName = 'Stats';

export function StatsCard({ 
  stats, 
  gameOver, 
  guesses, 
  onNewGame, 
  revealedAnswer,
  language,
  className 
}: StatsCardProps) {
  const isWon = guesses.length > 0 && guesses[guesses.length - 1].isCorrect;
  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const handleSearch = () => {
    if (revealedAnswer) {
      window.open(`https://www.google.com/search?q=${revealedAnswer}+definition`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {gameOver && stats && (
        <motion.div
          {...ANIMATIONS.REVEAL}
          className={cn(
            "flex items-center justify-center ",
            className
          )}
        >
          <motion.div 
            className="bg-transparent p-6  max-w-md w-full mx-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-primary">
                {isWon ? t('youWon', language) : t('gameOver', language)}
              </h2>
              {gameOver && !isWon && revealedAnswer && (
                <p className="text-lg text-primary">
                  {t('answer', language, { word: revealedAnswer })}
                  <button
                    onClick={handleSearch}
                    className="inline-flex items-center ml-2 text-muted-foreground hover:text-primary"
                    title={t('searchDefinition', language)}
                  >
                    <Search size={16} />
                  </button>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Stats 
                label={t('streak', language)} 
                value={stats.currentStreak}
                highlight={stats.currentStreak > 0}
              />
              <Stats 
                label={t('maxStreak', language)} 
                value={stats.maxStreak}
                highlight={stats.currentStreak === stats.maxStreak && stats.maxStreak > 0}
              />
              <Stats 
                label={t('gamesPlayed', language)} 
                value={stats.gamesPlayed} 
              />
              <Stats 
                label={t('winPercentage', language)} 
                value={winPercentage} 
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={onNewGame}
                variant="outline"
                className="flex-1 py-2 text-white rounded-lg font-bold"
              >
                {t('newGame', language)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 