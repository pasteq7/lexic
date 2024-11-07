import { motion } from 'framer-motion';
import { Language, TRIES, type LetterState, GuessResult } from '@/lib/words';
import { Cell } from '@/components/game/Cell';
interface BoardProps {
  guesses: GuessResult[];
  currentGuess: string;
  wordLength: number;
  shake: boolean;
  language: Language;
}

export function Board({ guesses, currentGuess, wordLength, shake, language }: BoardProps) {
  if (!wordLength) return null;

  return (
    <div className="w-full max-w-[var(--game-max-width)] mx-auto">
      <div className="grid gap-1 place-items-center mb-4">
        {Array(TRIES).fill(null).map((_, i) => {
          if (i < guesses.length) {
            return (
              <Row 
                key={i} 
                word={guesses[i].word}
                states={guesses[i].letterStates}
                wordLength={wordLength}
              />
            );
          }
          if (i === guesses.length) {
            return (
              <Row 
                key={i}
                word={currentGuess}
                states={Array(wordLength).fill('empty')}
                wordLength={wordLength}
                isActive={true}
                shake={shake}
              />
            );
          }
          return (
            <Row 
              key={i}
              word=""
              states={Array(wordLength).fill('empty')}
              wordLength={wordLength}
            />
          );
        })}
      </div>
    </div>
  );
}

interface RowProps {
  word: string;
  states: LetterState[];
  wordLength: number;
  isActive?: boolean;
  shake?: boolean;
}

function Row({ word, states, wordLength, isActive = false, shake = false }: RowProps) {
  const cells = Array(wordLength).fill('').map((_, i) => word[i] || '');

  return (
    <motion.div 
      className="flex" 
      animate={shake ? { x: [-2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
    >
      {cells.map((letter, i) => (
        <Cell 
          key={i}
          letter={letter}
          state={states[i]}
          isActive={isActive}
          delay={i}
        />
      ))}
    </motion.div>
  );
}