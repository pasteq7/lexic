import { GameStats, GuessResult } from '@/lib/words';
import { Stats } from '@/components/ui/stats-ui';
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsCardProps {
  stats: GameStats;
  gameOver: boolean;
  guesses: GuessResult[];
  onNewGame: () => void;
  revealedAnswer?: string | null;
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
  revealedAnswer 
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
          {isWon ? 'Congratulations!' : 'Game Over!'}
        </h2>
        {gameOver && !isWon && revealedAnswer && (
          <p className="text-lg text-muted-foreground">
            The word was:{" "}
            <span className="font-bold text-primary">
              {revealedAnswer}
              <button
                onClick={handleSearch}
                className="inline-flex items-center ml-2 text-muted-foreground hover:text-primary"
                title="Search definition"
              >
                <Search size={16} />
              </button>
            </span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Stats label="Played" value={stats.gamesPlayed} />
        <Stats label="Win %" value={calculateWinPercentage(stats)} />
        <Stats label="Streak" value={stats.currentStreak} />
        <Stats label="Max Streak" value={stats.maxStreak} />
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onNewGame}
          variant="outline"
          className="flex-1 py-2 text-white rounded-lg font-bold"
        >
          New Game
        </Button>
      </div>
    </div>
  );
} 