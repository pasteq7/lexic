import { Language } from "./words";

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
  | 'statistics'
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
  | 'home';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    startGame: 'Start Game',
    settings: 'Settings',
    howToPlay: 'How to Play',
    keyboardLayout: 'Keyboard Layout',
    chooseLayout: 'Choose your preferred keyboard layout for typing.',
    clearData: 'Clear Data',
    confirmClear: 'Are you sure? This will clear all game data.',
    cancelClear: 'Cancel',
    gameRules: [
      'Guess the word.',
      'Each guess must be a valid word.',
      'After each guess, the color of the tiles will change:',
      '🟩 Green: Letter is correct and in right position',
      '🟨 Yellow: Letter is in the word but wrong position',
      '⬜ Empty: Letter is not in the word'
    ].join('\n'),
    newGame: 'New Game',
    statistics: 'Statistics',
    configureKeyboard: 'Configure your keyboard layout and manage game data.',
    wordLength: 'Word must be {length} letters',
    invalidWord: 'Invalid word',
    notInList: 'Not in word list',
    gameOver: 'Game Over',
    youWon: 'You won!',
    answer: 'The word was: {word}',
    winPercentage: 'Win %',
    streak: 'Current Streak',
    maxStreak: 'Max Streak',
    searchDefinition: 'Search definition',
    error: 'Error',
    noActiveGame: 'No active game',
    invalidCharacters: 'Invalid characters',
    notInWordList: 'Not in word list',
    failedToStart: 'Failed to start game',
    home: 'Home'
  },
  fr: {
    startGame: 'Commencer',
    settings: 'Paramètres',
    howToPlay: 'Comment Jouer',
    keyboardLayout: 'Disposition du Clavier',
    chooseLayout: 'Choisissez votre disposition de clavier préférée.',
    clearData: 'Effacer les Données',
    confirmClear: 'Êtes-vous sûr ? Cela effacera toutes les données du jeu.',
    cancelClear: 'Annuler',
    gameRules: [
      'Devinez le mot.',
      'Chaque essai doit être un mot valide.',
      'Après chaque essai, la couleur des tuiles changera :',
      '🟩 Vert : Lettre correcte et bien placée',
      '🟨 Jaune : Lettre dans le mot mais mal placée',
      '⬜ Vide : Lettre absente du mot'
    ].join('\n'),
    newGame: 'Nouvelle Partie',
    statistics: 'Statistiques',
    configureKeyboard: 'Configurez votre clavier et gérez les données du jeu.',
    wordLength: 'Le mot doit faire {length} lettres',
    invalidWord: 'Mot invalide',
    notInList: 'Mot non trouvé',
    gameOver: 'Partie Terminée',
    youWon: 'Vous avez gagné !',
    answer: 'Le mot était : {word}',
    winPercentage: 'Victoires %',
    streak: 'Série Actuelle',
    maxStreak: 'Série Max',
    searchDefinition: 'Chercher la définition',
    error: 'Erreur',
    noActiveGame: 'Aucune partie active',
    invalidCharacters: 'Caractères invalides',
    notInWordList: 'Mot non trouvé',
    failedToStart: 'Échec du démarrage',
    home: 'Accueil'
  }
};

export function t(key: TranslationKey, lang: Language, params?: Record<string, string | number>): string {
  const text = translations[lang][key];
  if (!params) return text;
  
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(`{${key}}`, value.toString()),
    text
  );
}
export type { Language };

