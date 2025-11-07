// components/game/ReviewCard.tsx
import { GameMode, GameStats, GuessResult } from '@/lib/types/game';
import { Search, Trophy, XCircle, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';
import { Language } from '@/lib/types/i18n';

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

const StatDisplay = React.memo(({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-primary">{value}</div>
    <div className="text-xs text-primary/60 uppercase tracking-wider">{label}</div>
  </div>
));
StatDisplay.displayName = 'StatDisplay';

export function ReviewCard({
  stats,
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "bg-background/80 backdrop-blur-md border border-primary/20 rounded-xl shadow-2xl",
        "w-full max-w-sm p-6 text-center",
        className
      )}
    >
      <div className="flex flex-col items-center mb-4">
        {isWon ? (
          <Trophy className="w-12 h-12 text-correct mb-2" />
        ) : (
          <XCircle className="w-12 h-12 text-destructive mb-2" />
        )}
        <h2 className="text-2xl font-bold text-primary">
          {isWon ? t('youWon', language) : t('gameOver', language)}
        </h2>
        {revealedAnswer && (
          <div className="flex items-center mt-1">
            <p className="text-lg text-primary/80">
              {t('answer', language, { word: revealedAnswer.toUpperCase() })}
            </p>
            <button
              onClick={handleSearch}
              className="ml-2 text-primary/60 hover:text-primary transition-colors"
              title={t('searchDefinition', language)}
            >
              <Search size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-6 my-8">
        <StatDisplay
          label={t('streak', language)}
          value={stats.currentStreak}
        />
        <StatDisplay
          label={t('maxStreak', language)}
          value={stats.maxStreak}
        />
        <StatDisplay
          label={t('gamesPlayed', language)}
          value={stats.gamesPlayed}
        />
        <StatDisplay
          label={t('winPercentage', language)}
          value={`${winPercentage}%`}
        />
      </div>
      
      <div className="flex flex-col items-center gap-3">
        {gameMode === 'infinite' && (
          <>
            <Button
              onClick={onNewGame}
              variant="outline"
              className="w-full py-6 text-lg font-bold text-primary"
            >
              {t('newGame', language)}
            </Button>
            <div className="flex items-center gap-2 text-sm text-primary/70">
              <Keyboard size={14} />
              <span>{t('pressEnterNewGame', language)}</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}