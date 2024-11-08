import { NextResponse } from 'next/server';
import { validateGuess, getLetterStates, normalizeWord } from '@/lib/game/validation';
import { cookies } from 'next/headers';
import { TRIES } from '@/lib/game/constants';

export async function POST(request: Request) {
  const { guess, language = 'en', guessCount } = await request.json();
  
  const answer = cookies().get('gameWord')?.value;
  if (!answer) {
    return NextResponse.json({ 
      isValid: false, 
      message: 'noActiveGame'
    });
  }
  
  const validation = validateGuess(guess, answer.length, language);
  
  if (!validation.isValid) {
    return NextResponse.json({ 
      isValid: false, 
      message: validation.message || 'notInWordList'
    });
  }
  
  const letterStates = getLetterStates(guess, answer);
  const isCorrect = normalizeWord(guess.toLowerCase()) === normalizeWord(answer.toLowerCase());
  const isGameOver = isCorrect || guessCount >= TRIES - 1; 
  
  return NextResponse.json({
    isValid: true,
    letterStates,
    isCorrect,
    answer: isGameOver ? answer : undefined,
    guessCount: guessCount + 1
  });
} 