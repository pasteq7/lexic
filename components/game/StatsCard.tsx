import { GameStats, GuessResult } from '@/lib/words';
import { Stats } from '@/components/ui/stats-ui';
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from '@/lib/translations';
import { Language } from '@/lib/words';

interface StatsCardProps {
  stats: GameStats;
  gameOver: boolean;
  guesses: GuessResult[];
  onNewGame: () => void;
  revealedAnswer?: string | null;
  language: Language;
}

const calculateWinPercentage = (stats: GameStats) => {
  return stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;
};

export function StatsCard({ 
  stats, 
  gameOver, 
  guesses, 
  onNewGame, 
  revealedAnswer,
  language 
}: StatsCardProps) {
  const isWon = gameOver && guesses.length > 0 && guesses[guesses.length - 1].isCorrect;

  const handleSearch = () => {
    if (revealedAnswer) {
      window.open(`https://www.google.com/search?q=${revealedAnswer}+definition`, '_blank');
    }
  };

  return (
    <div className="absolute left-full ml-8 w-80 p-6 rounded-lg h-fit">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-primary">
          {isWon ? t('youWon', language) : t('gameOver', language)}
        </h2>
        {gameOver && !isWon && revealedAnswer && (
          <p className="text-lg text-muted-foreground">
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
        <Stats label={t('statistics', language)} value={stats.gamesPlayed} />
        <Stats label={t('winPercentage', language)} value={calculateWinPercentage(stats)} />
        <Stats label={t('streak', language)} value={stats.currentStreak} />
        <Stats label={t('maxStreak', language)} value={stats.maxStreak} />
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
    </div>
  );
} 