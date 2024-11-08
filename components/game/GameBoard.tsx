import { Board } from './Board';
import Keyboard from './Keyboard';
import { StatsCard } from './StatsCard';
import { GuessResult, type GameStats } from '@/lib/types/game';
import { type KeyState, KeyboardLayout } from '@/lib/types/keyboard';
import { type Language } from '@/lib/types/i18n';

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
  revealedAnswer: string | null;
  language: Language;
  isSubmitting: boolean;
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
  language,
  isSubmitting
}: GameBoardProps) {
  return (
    <div className="relative flex flex-col justify-center w-full">
      <div className="w-full max-w-[480px] mx-auto flex flex-col items-center">
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          wordLength={wordLength}
          shake={shake}
        />
        <div className="w-full pb-4">
          <Keyboard
            onKey={onKeyPress}
            keyStates={keyStates}
            keyboardLayout={keyboardLayout}
            isSubmitting={isSubmitting}
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
          language={language}
          className="lg:absolute lg:top-0 lg:left-full lg:ml-4 mt-4 lg:mt-0 mx-auto"
        />
      )}
    </div>
  );
} 