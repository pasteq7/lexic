import { GameMode, GameStats, GuessResult } from '@/lib/types/game';
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Language } from '@/lib/types/i18n';
import { ANIMATIONS, STATS_ANIMATIONS } from '@/lib/utils/animations';
import { Keyboard } from "lucide-react";

interface ReviewCardProps {
  stats: GameStats;
  gameOver: boolean;
  guesses: GuessResult[];
  onNewGame: () => void;
  revealedAnswer?: string | null;
  language: Language;
  className?: string;
  gameMode: GameMode;
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

export function ReviewCard({
  stats,
  gameOver,
  guesses,
  onNewGame,
  revealedAnswer,
  language,
  className,
  gameMode
}: ReviewCardProps) {
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
            "flex items-center justify-center",
            className
          )}
        >
          <motion.div
            className="bg-transparent p-6 max-w-2xl w-full mx-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
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

            <div className="grid grid-cols-2 gap-6 mb-8">
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
            
            <div className="flex justify-center gap-6 flex-col items-center">
              {gameMode === 'infinite' && (
                <>
                  <Button
                    onClick={onNewGame}
                    variant="outline"
                    className="w-48 py-3 text-white rounded-lg font-bold"
                  >
                    {t('newGame', language)}
                  </Button>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground mt-2"
                  >
                    <Keyboard size={16} />
                    {t('pressEnterNewGame', language)}
                  </motion.div>
                </>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}