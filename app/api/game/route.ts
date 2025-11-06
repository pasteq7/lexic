import { NextResponse } from 'next/server';
import { getRandomWord, getWordOfTheDay, getTodaysSetWord } from '@/lib/game/words';
import { cookies } from 'next/headers';
import { GameMode } from '@/lib/types/game';

export async function POST(request: Request) {
  try {
    const { action, language = 'en', gameMode = 'infinite' } = await request.json();
    
    if (action === 'new') {
      let word: string;
      switch(gameMode as GameMode) {
        case 'wordOfTheDay':
          word = getWordOfTheDay(language);
          break;
        case 'todaysSet':
          word = getTodaysSetWord(language);
          break;
        case 'infinite':
        default:
          word = getRandomWord(language);
          break;
      }
      
      const length = word.length;
      
      // Store word in httpOnly cookie 
      cookies().set('gameWord', word, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      return NextResponse.json({
        success: true,
        length: length,
        firstLetter: word.charAt(0).toLowerCase(),
      });
    }
    
    return NextResponse.json({ success: false, error: 'invalidAction' });
  } catch (e) {
    const error = e as Error;
    console.error("Failed to start new game:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: 'failedToStart' 
    }, { status: 500 });
  }
}