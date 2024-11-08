import { NextResponse } from 'next/server';
import { getRandomWord } from '@/lib/game/words';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { action, language = 'en' } = await request.json();
    
    if (action === 'new') {
      const word = getRandomWord(language);
      const length = word.length;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.info('New game word:', word, 'language:', language);
      }
      
      // Store plain word in httpOnly cookie (it's secure enough)
      cookies().set('gameWord', word, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      
      return NextResponse.json({
        success: true,
        length: length,
      });
    }
    
    return NextResponse.json({ success: false, error: 'invalidAction' });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'failedToStart' 
    }, { status: 500 });
  }
} 