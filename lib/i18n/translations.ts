import { Language, TranslationKey } from '@/lib/types/i18n';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    startGame: 'Play',
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
    gamePlayed: 'Game Played',
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
    home: 'Home',
    viewStats: 'View Statistics',
    gamesPlayed: 'Played',
    winRate: 'Win Rate',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    dataCleared: 'Game data cleared successfully',
    failedToClear: 'Failed to clear game data',
    statistics: 'Statistics',
    avgGuesses: 'Avg. Guesses',
    gamesWon: 'Games Won',
    guessDistribution: 'Guess Distribution',
    lastPlayed: 'Last Played',
    confirmDelete: 'Are you sure? ',  
    cancel: 'Cancel',
    clearGameData: 'Clear Game Data',
    pressEnterNewGame: 'Press Enter for New Game',
    infinite: 'Infinite',
    wordOfTheDay: 'Word of the Day',
    todaysSet: "Today's Set",
    loading: 'Loading...',
    firstLetterLocked: 'The first letter is locked.',
  },
  fr: {
    startGame: 'Jouer',
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
    gamePlayed: 'Parties Jouées',
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
    home: 'Accueil',
    viewStats: 'Voir les Statistiques',
    gamesPlayed: 'Parties',
    winRate: 'Taux de Réussite',
    currentStreak: 'Série Actuelle',
    bestStreak: 'Meilleure Série',
    dataCleared: 'Données du jeu effacées avec succès',
    failedToClear: 'Échec de l\'effacement des données',
    statistics: 'Statistiques',
    avgGuesses: 'Moy. essais',
    gamesWon: 'Parties Gagnées',
    guessDistribution: 'Distribution des essais',
    lastPlayed: 'Dernière partie',
    confirmDelete: 'Êtes-vous sûr ?',
    cancel: 'Annuler',
    clearGameData: 'Effacer les Données du Jeu',
    pressEnterNewGame: 'Appuyez sur Entrée pour une nouvelle partie',
    infinite: 'Infini',
    wordOfTheDay: 'Mot du Jour',
    todaysSet: 'Série du Jour',
    loading: 'Chargement...',
    firstLetterLocked: 'La première lettre est verrouillée.',
  }
};

export function t(key: TranslationKey, lang: Language, params?: Record<string, string | number>): string {
  const text = translations[lang][key];
  if (!text) {
    console.warn(`Translation key "${key}" not found for language "${lang}".`);
    return translations['en'][key] || key;
  }
  if (!params) return text;
  
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(`{${key}}`, value.toString()),
    text
  );
}

// Type for translation parameters
export type TranslationParams = Record<string, string | number>;

// Add validation for translation keys
export function validateTranslationKey(key: string): key is TranslationKey {
  return key in translations.en;
}

// Add missing translation detection
export function getMissingTranslations(): TranslationKey[] {
  const enKeys = Object.keys(translations.en);
  const frKeys = Object.keys(translations.fr);
  return enKeys.filter(key => !frKeys.includes(key)) as TranslationKey[];
}