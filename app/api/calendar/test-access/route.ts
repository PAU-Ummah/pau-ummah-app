import { NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/google-calendar';

export async function GET() {
  try {
    const result = await googleCalendarService.getCalendarList();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Calendar access test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
