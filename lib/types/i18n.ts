export type Language = 'en' | 'fr';
export type TranslationKey = 
  | 'startGame'
  | 'settings'
  | 'howToPlay'
  | 'keyboardLayout'
  | 'chooseLayout'
  | 'clearData'
  | 'confirmClear'
  | 'cancelClear'
  | 'gameRules'
  | 'newGame'
  | 'gamePlayed'
  | 'configureKeyboard'
  | 'wordLength'
  | 'invalidWord'
  | 'notInList'
  | 'gameOver'
  | 'youWon'
  | 'answer'
  | 'winPercentage'
  | 'streak'
  | 'maxStreak'
  | 'searchDefinition'
  | 'error'
  | 'noActiveGame'
  | 'invalidCharacters'
  | 'notInWordList'
  | 'failedToStart'
  | 'home'
  | 'viewStats'
  | 'gamesPlayed'
  | 'winRate'
  | 'currentStreak'
  | 'bestStreak'
  | 'dataCleared'
  | 'failedToClear'
  | 'statistics'
  | 'guessDistribution'
  | 'avgGuesses'
  | 'lastPlayed'
  | 'gamesWon'
  | 'confirmDelete'
  | 'cancel'
  | 'clearGameData';

export type TranslationParams = Record<string, string | number>;