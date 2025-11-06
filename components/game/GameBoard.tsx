// components/game/GameBoard.tsx
import { Board } from './Board';
import Keyboard from './Keyboard';
import { ReviewCard } from './ReviewCard';
import { GuessResult, type GameStats, GameMode, LetterState } from '@/lib/types/game';
import { type KeyState, KeyboardLayout } from '@/lib/types/keyboard';
import { type Language } from '@/lib/types/i18n';
import { Loader } from '@/components/ui/Loader';

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
  isLoading: boolean;
  gameMode: GameMode;
  initialStates?: LetterState[];
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
  isSubmitting,
  isLoading,
  gameMode,
  initialStates,
}: GameBoardProps) {
  if (isLoading) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-8">
      <div className="relative flex flex-col justify-center w-full max-w-[480px]">
        <div className="w-full mx-auto flex flex-col items-center">
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            wordLength={wordLength}
            shake={shake}
            initialStates={initialStates}
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
      </div>

      {showStats && (
        <ReviewCard
          stats={stats}
          gameOver={gameOver}
          guesses={guesses}
          onNewGame={onNewGame}
          revealedAnswer={revealedAnswer}
          language={language}
          gameMode={gameMode}
          className="w-full max-w-md"
        />
      )}
    </div>
  );
}