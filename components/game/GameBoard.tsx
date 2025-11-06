// components/game/GameBoard.tsx
import { AnimatePresence } from 'framer-motion';
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
  todaysSetIndex?: number;
  todaysSetTotal?: number;
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
  todaysSetIndex,
  todaysSetTotal,
}: GameBoardProps) {
  if (isLoading) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative flex-grow flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      {/* Game Area */}
      <div className="w-full flex flex-col items-center justify-center gap-4">
        {gameMode === 'todaysSet' && todaysSetTotal && (
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold text-primary">
              {`Word ${todaysSetIndex! + 1} of ${todaysSetTotal}`}
            </h3>
          </div>
        )}
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          wordLength={wordLength}
          shake={shake}
          initialStates={initialStates}
        />
        <Keyboard
          onKey={onKeyPress}
          keyStates={keyStates}
          keyboardLayout={keyboardLayout}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Review Card Overlay */}
      <AnimatePresence>
        {showStats && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <ReviewCard
              stats={stats}
              gameOver={gameOver}
              guesses={guesses}
              onNewGame={onNewGame}
              revealedAnswer={revealedAnswer}
              language={language}
              gameMode={gameMode}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}