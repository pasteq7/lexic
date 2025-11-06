// app/api/validate/route.ts
import { NextResponse } from 'next/server';
import { validateGuess, getLetterStates, normalizeWord } from '@/lib/game/validation';
import { cookies } from 'next/headers';
import { TRIES } from '@/lib/game/constants';

export async function POST(request: Request) {
  const { guess, language = 'en', guessCount, todaysSetIndex = 0 } = await request.json();
  
  const wordCookie = cookies().get('gameWord')?.value;
  if (!wordCookie) {
    return NextResponse.json({ 
      isValid: false, 
      message: 'noActiveGame'
    });
  }

  const wordSet = wordCookie.split(',');
  const answer = wordSet[todaysSetIndex];

  if (!answer) {
    return NextResponse.json({ isValid: false, message: 'noActiveGame' });
  }
  
  const validation = validateGuess(guess, answer.length, language);
  
  if (!validation.isValid) {
    return NextResponse.json({ isValid: false, message: validation.message || 'notInWordList' });
  }
  
  const letterStates = getLetterStates(guess, answer);
  const isCorrect = normalizeWord(guess.toLowerCase()) === normalizeWord(answer.toLowerCase());
  const isLastWordInSet = todaysSetIndex === wordSet.length - 1;

  // If the word is correct but it's not the last one in the set, provide info for the next word
  if (isCorrect && !isLastWordInSet) {
    const nextWord = wordSet[todaysSetIndex + 1];
    return NextResponse.json({
        isValid: true,
        letterStates,
        isCorrect,
        isLastWordInSet: false,
        nextWordInfo: {
            length: nextWord.length,
            firstLetter: nextWord.charAt(0).toLowerCase()
        }
    });
  }
  
  // The game ends if the last word is guessed correctly, or if tries are exhausted on any word
  const isGameOver = (isCorrect && isLastWordInSet) || (!isCorrect && guessCount >= TRIES - 1);
  
  return NextResponse.json({
    isValid: true,
    letterStates,
    isCorrect,
    isLastWordInSet,
    // Reveal all words only when the game is truly over
    answer: isGameOver ? wordSet.join(', ') : undefined,
    guessCount: guessCount + 1
  });
}