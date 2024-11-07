import { NextResponse } from 'next/server';
import { validateGuess, getLetterStates } from '@/lib/words';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { guess, language = 'en', guessCount } = await request.json();
  
  const answer = cookies().get('gameWord')?.value;
  if (!answer) {
    return NextResponse.json({ 
      isValid: false, 
      message: 'No active game' 
    });
  }
  
  const validation = validateGuess(guess, answer.length, language);
  
  if (validation.isValid) {
    const letterStates = getLetterStates(guess, answer, language);
    const isCorrect = guess.toLowerCase() === answer.toLowerCase();
    const isGameOver = isCorrect || guessCount >= 5; // 6th guess (0-based index)
    
    return NextResponse.json({
      isValid: true,
      letterStates,
      isCorrect,
      answer: isGameOver ? answer : undefined // Only send answer if game is over
    });
  }
  
  return NextResponse.json(validation);
} 