import { Board } from './Board';
import { Keyboard } from './Keyboard';
import { StatsCard } from './StatsCard';
import { GuessResult, type GameStats } from '@/lib/words';
import { type KeyState, KeyboardLayout } from '@/lib/utils';

interface GameBoardProps {
  guesses: GuessResult[];
  currentGuess: string;
  wordLength: number;
  shake: boolean;
  showStats: boolean;
  stats: GameStats;
  gameOver: boolean;
  keyStates: Record<string, KeyState>;
  onKeyPress: (key: string) => void;
  onNewGame: () => void;

  keyboardLayout: KeyboardLayout;
  revealedAnswer?: string | null;
}

export function GameBoard({
  guesses,
  currentGuess,
  wordLength,
  shake,
  showStats,
  stats,
  gameOver,
  keyStates,
  onKeyPress,
  onNewGame,
  keyboardLayout,
  revealedAnswer,
}: GameBoardProps) {
  return (
    <div className="relative flex justify-center w-full mt-8">
      <div className="w-[480px] flex flex-col items-center">
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          wordLength={wordLength}
          shake={shake}
        />
        <div className="w-full pb-4">
          <Keyboard
            onKeyPress={onKeyPress}
            keyStates={keyStates}
            keyboardLayout={keyboardLayout}
          />
        </div>
      </div>

      {showStats && (
        <StatsCard
          stats={stats}
          gameOver={gameOver}
          guesses={guesses}
          onNewGame={onNewGame}
          revealedAnswer={revealedAnswer}
        />
      )}
    </div>
  );
} 