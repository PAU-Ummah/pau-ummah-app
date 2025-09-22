import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/lib/google-calendar';
import { getTodaysPrayerTimes } from '@/lib/prayerTimes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    // Validate input
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range (max 1 year)
    const maxDays = 365;
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxDays) {
      return NextResponse.json(
        { error: `Date range cannot exceed ${maxDays} days` },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Get prayer times
    const prayerTimes = getTodaysPrayerTimes();

    // Create calendar events
    const result = await googleCalendarService.createPrayerEvents(prayerTimes, start, end);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully created ${result.eventsCreated} prayer time events in your Google Calendar`,
        eventsCreated: result.eventsCreated,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create calendar events' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Calendar subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Test calendar access
    const result = await googleCalendarService.getCalendarList();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Google Calendar access verified',
        calendars: result.calendars?.length || 0,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to access Google Calendar' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Calendar access test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
