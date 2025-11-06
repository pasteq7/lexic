// app/api/game/route.ts
import { NextResponse } from 'next/server';
import { getRandomWord, getWordOfTheDay, getTodaysUniqueSet } from '@/lib/game/words';
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
    const body: GameRequest = await request.json();
    const { action, language = 'en', gameMode = 'infinite', sessionId } = body;

    if (action !== 'new') {
      return NextResponse.json({ success: false, error: 'invalidAction' }, { status: 400 });
    }

    let word: string;
    let wordSet: string[] = [];

    const selectedLanguage = language as 'en' | 'fr';

    switch (gameMode as GameMode) {
      case 'wordOfTheDay':
        word = getWordOfTheDay(selectedLanguage);
        break;
      case 'todaysSet':
        // Generate a set of 3 unique words
        wordSet = getTodaysUniqueSet(selectedLanguage, 3);
        if (wordSet.length < 3) {
           return NextResponse.json({ success: false, error: 'noWordsAvailable' }, { status: 500 });
        }
        word = wordSet[0]; // The first word of the set
        break;
      case 'infinite':
      default:
        word = getRandomWord(selectedLanguage);
        break;
    }

    if (!word) {
      return NextResponse.json({ success: false, error: 'noWordsAvailable' }, { status: 500 });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    };

    // For "Today's Set", store the whole set as a comma-separated string
    const wordToStore = gameMode === 'todaysSet' ? wordSet.join(',') : word;
    cookies().set('gameWord', wordToStore, cookieOptions);

    if (sessionId) {
      cookies().set('gameSession', sessionId, { ...cookieOptions, httpOnly: false });
    }

    return NextResponse.json({
      success: true,
      length: word.length,
      firstLetter: word.charAt(0).toLowerCase(),
      gameMode,
      timestamp: Date.now(),
      // For 'todaysSet', let the client know how many words there are
      todaysSetTotal: gameMode === 'todaysSet' ? wordSet.length : undefined,
    });

  } catch (error) {
    console.error('Game API error:', error);
    return NextResponse.json({ success: false, error: 'serverError' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}