export type GameMode = 'infinite' | 'wordOfTheDay' | 'todaysSet';

export type GameState = 'playing' | 'won' | 'lost';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayed: number;
  lastCompleted: number;
  guessDistribution: Record<number, number>;
  recentGames: {
    word: string;
    guesses: number;
    won: boolean;
    timestamp: number;
  }[];
}

export interface GameResult {
  won: boolean;
  numGuesses: number;
  word: string;
  timestamp: number;
}

export type LetterState = "correct" | "present" | "absent" | "empty";

export interface GuessResult {
  word: string;
  letterStates: LetterState[];
  isCorrect: boolean;
} 

export interface StatsError {
    code: string;
    message: string;
  }
  
export interface StatsValidation {
    isValid: boolean;
    errors?: StatsError[];
  }