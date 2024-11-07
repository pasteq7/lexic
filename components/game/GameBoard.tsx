import { Board } from './Board';
import { Keyboard } from './Keyboard';
import { StatsCard } from './StatsCard';
import { type Language, GuessResult } from '@/lib/words';
import { type KeyState, KeyboardLayout } from '@/lib/utils';
import { t } from '@/lib/translations';

interface GameBoardProps {
  guesses: GuessResult[];
  currentGuess: string;
  wordLength: number;
  shake: boolean;
  showStats: boolean;
  stats: any;
  gameOver: boolean;
  keyStates: Record<string, KeyState>;
  language: Language;
  onKeyPress: (key: string) => void;
  onHome: () => void;
  onNewGame: () => void;
  onShare: () => void;
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
  language,
  onKeyPress,
  onNewGame,
  onShare,
  keyboardLayout,
  revealedAnswer,
}: GameBoardProps) {
  return (
    <div className="relative flex justify-center w-full">
      <div className="w-[480px] flex flex-col items-center">
        <Board
          guesses={guesses}
          currentGuess={currentGuess}
          wordLength={wordLength}
          shake={shake}
          language={language}
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
          onShare={onShare}
          revealedAnswer={revealedAnswer}
        />
      )}
    </div>
  );
} 