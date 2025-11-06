// app/api/game/route.ts - ROBUST ERROR HANDLING
import { NextResponse } from 'next/server';
import { getRandomWord, getWordOfTheDay, getTodaysSetWord } from '@/lib/game/words';
import { cookies } from 'next/headers';
import { GameMode } from '@/lib/types/game';

interface GameRequest {
  action: string;
  language?: string;
  gameMode?: string;
  sessionId?: string;
}

export async function POST(request: Request) {
  try {
    // Parse request body with validation
    let body: GameRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'invalidRequest' 
      }, { status: 400 });
    }

    const { action, language = 'en', gameMode = 'infinite', sessionId } = body;
    
    // Validate action
    if (action !== 'new') {
      return NextResponse.json({ 
        success: false, 
        error: 'invalidAction' 
      }, { status: 400 });
    }

    // Validate language
    if (language !== 'en' && language !== 'fr') {
      return NextResponse.json({ 
        success: false, 
        error: 'invalidLanguage' 
      }, { status: 400 });
    }

    // Validate game mode
    const validModes = ['infinite', 'wordOfTheDay', 'todaysSet'];
    if (!validModes.includes(gameMode)) {
      return NextResponse.json({ 
        success: false, 
        error: 'invalidGameMode' 
      }, { status: 400 });
    }

    // Select word based on game mode
    let word: string;
    try {
      switch(gameMode as GameMode) {
        case 'wordOfTheDay':
          word = getWordOfTheDay(language as 'en' | 'fr');
          break;
        case 'todaysSet':
          word = getTodaysSetWord(language as 'en' | 'fr');
          break;
        case 'infinite':
        default:
          word = getRandomWord(language as 'en' | 'fr');
          break;
      }
    } catch (error) {
      console.error('Word selection error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'noWordsAvailable' 
      }, { status: 500 });
    }

    // Validate word
    if (!word || word.length < 4 || word.length > 9) {
      console.error('Invalid word generated:', word);
      return NextResponse.json({ 
        success: false, 
        error: 'invalidWordGenerated' 
      }, { status: 500 });
    }

    const length = word.length;
    const firstLetter = word.charAt(0).toLowerCase();

    // Store word in httpOnly cookie with session tracking
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    };

    try {
      cookies().set('gameWord', word, cookieOptions);
      
      // Store session info for debugging
      if (sessionId) {
        cookies().set('gameSession', sessionId, {
          ...cookieOptions,
          httpOnly: false, // Allow client to read this
        });
      }
    } catch (error) {
      console.error('Cookie error:', error);
      // Continue anyway - game can still work without cookies
    }

    // Return success response
    return NextResponse.json({
      success: true,
      length,
      firstLetter,
      gameMode,
      timestamp: Date.now(),
    });

  } catch (error) {
    // Catch-all error handler
    console.error('Game API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'serverError' 
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: Date.now(),
  });
}