import { google, calendar_v3 } from "googleapis";
import { cookies } from 'next/headers';

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

// Infer the exact auth type accepted by google.calendar options
type CalendarOptions = Parameters<typeof google.calendar>[0];
type CalendarAuth = CalendarOptions extends { auth?: infer A } ? A : never;

class GoogleCalendarService {
  private client: calendar_v3.Calendar | null = null;
  private auth: unknown | null = null;

  private createOAuthClient(accessToken: string, refreshToken?: string): unknown {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pau-ummah-app.vercel.app';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials are not configured");
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return oauth2Client;
  }

  private async getAuthClientFromCookies(): Promise<unknown> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
      throw new Error("No valid Google authentication found. Please authenticate first.");
    }

    return this.createOAuthClient(accessToken, refreshToken);
  }

  private async getClient(): Promise<calendar_v3.Calendar> {
    if (this.client) return this.client;
    const auth = (await this.getAuthClientFromCookies()) as unknown as CalendarAuth;
    this.client = google.calendar({ version: "v3", auth });
    return this.client;
  }

  async authenticate() {
    await this.getClient();
  }

  /**
   * Create prayer time events in Google Calendar
   */
  async createPrayerEvents(prayerTimes: Array<{
    name: string;
    displayName: string;
    callToPrayer: string;
    congregation: string;
  }>, startDate: Date, endDate: Date): Promise<{ success: boolean; eventsCreated: number; error?: string }> {
    try {
      const calendar = await this.getClient();
      const timeZone = 'Africa/Lagos';
      
      // Generate events for each day in the date range
      const events: CalendarEvent[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        for (const prayer of prayerTimes) {
          // Skip Jumu'ah on non-Friday days
          if (prayer.name === 'jumuah' && currentDate.getDay() !== 5) {
            continue;
          }
          
          // Skip other prayers on Friday (replace with Jumu'ah)
          if (prayer.name === 'dhuhr' && currentDate.getDay() === 5) {
            continue;
          }

          const [adhanHour, adhanMinute] = prayer.callToPrayer.split(':').map(Number);
          const [iqamahHour, iqamahMinute] = prayer.congregation.split(':').map(Number);

          // Create Adhan event
          const adhanStart = new Date(currentDate);
          adhanStart.setHours(adhanHour, adhanMinute, 0, 0);
          
          const adhanEnd = new Date(adhanStart);
          adhanEnd.setMinutes(adhanEnd.getMinutes() + 5); // 5-minute duration

          events.push({
            summary: `${prayer.displayName} - Adhan`,
            description: `Call to prayer for ${prayer.displayName} at PAU Mosque`,
            start: {
              dateTime: adhanStart.toISOString(),
              timeZone: timeZone,
            },
            end: {
              dateTime: adhanEnd.toISOString(),
              timeZone: timeZone,
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 10 },
                { method: 'email', minutes: 30 },
              ],
            },
          });

          // Create Iqamah event
          const iqamahStart = new Date(currentDate);
          iqamahStart.setHours(iqamahHour, iqamahMinute, 0, 0);
          
          const iqamahEnd = new Date(iqamahStart);
          iqamahEnd.setMinutes(iqamahEnd.getMinutes() + 30); // 30-minute duration for prayer

          events.push({
            summary: `${prayer.displayName} - Iqamah`,
            description: `Congregational prayer for ${prayer.displayName} at PAU Mosque`,
            start: {
              dateTime: iqamahStart.toISOString(),
              timeZone: timeZone,
            },
            end: {
              dateTime: iqamahEnd.toISOString(),
              timeZone: timeZone,
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 5 },
                { method: 'email', minutes: 15 },
              ],
            },
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create events in batches to avoid rate limits
      const batchSize = 10;
      let eventsCreated = 0;
      
      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        
        const promises = batch.map(event => 
          calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
          })
        );
        
        await Promise.all(promises);
        eventsCreated += batch.length;
      }

      return { success: true, eventsCreated };
    } catch (error) {
      console.error('Failed to create prayer events:', error);
      return { 
        success: false, 
        eventsCreated: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get user's calendar list to verify access
   */
  async getCalendarList(): Promise<{ success: boolean; calendars?: unknown[]; error?: string }> {
    try {
      const calendar = await this.getClient();
      const response = await calendar.calendarList.list();
      
      return { 
        success: true, 
        calendars: response.data.items || [] 
      };
    } catch (error) {
      console.error('Failed to get calendar list:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
