import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';
import { format } from 'date-fns';

// Define prayer time type
export type PrayerTime = {
  name: string;
  displayName: string;
  callToPrayer: string;
  congregation: string;
};

// Lagos coordinates
const LAGOS_COORDS = new Coordinates(6.5244, 3.3792);
const TIME_FORMAT = 'HH:mm';

// Map prayer names to their display names and Adhan prayer enum values
const PRAYER_CONFIG = [
  { key: 'fajr', displayName: 'Fajr', prayerEnum: Prayer.Fajr },
  { key: 'dhuhr', displayName: 'Dhuhr', prayerEnum: Prayer.Dhuhr },
  { key: 'asr', displayName: 'Asr', prayerEnum: Prayer.Asr },
  { key: 'maghrib', displayName: 'Maghrib', prayerEnum: Prayer.Maghrib },
  { key: 'isha', displayName: 'Isha', prayerEnum: Prayer.Isha },
] as const;


// Helper to add minutes to a time string
const addMinutesToTime = (timeStr: string, minutes: number): string => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return format(date, TIME_FORMAT);
};

// Get prayer times for today
const getPrayerTimes = (): PrayerTime[] => {
  try {
    const date = new Date();
    const params = CalculationMethod.MuslimWorldLeague();
    
    // Adjustments for Nigeria
    params.madhab = 'shafi';
    params.highLatitudeRule = 'twilightangle';
    
    const prayerTimes = new PrayerTimes(LAGOS_COORDS, date, params);

    // Special case for Jumu'ah (Friday prayer)
    const isFriday = date.getDay() === 5; // 5 = Friday
    const jumuahTime = '13:20'; // Always set Jumu'ah time

    // Get all prayer times
    const prayers: PrayerTime[] = PRAYER_CONFIG.map(({ key, displayName, prayerEnum }) => {
      // On Friday, replace Dhuhr with Jumu'ah
      if (isFriday && key === 'dhuhr') {
        return {
          name: 'jumuah',
          displayName: "Jumu'ah",
          callToPrayer: jumuahTime,
          congregation: addMinutesToTime(jumuahTime, 30), // 30 minutes after adhan for Jumu'ah
        };
      }
      
      try {
        // Get the prayer time using the Adhan library
        const prayerTime = prayerTimes.timeForPrayer(prayerEnum);
        
        if (!prayerTime) {
          throw new Error(`Prayer time is null for ${key}`);
        }
        
        const callToPrayer = format(prayerTime, TIME_FORMAT);
        
        // Special logic for Zuhr (Dhuhr) iqamah time
        let congregation: string;
        if (key === 'dhuhr') {
          // If adhan time is 12:55 or later, iqamah is 1:05, otherwise 1:00
          if (callToPrayer >= '12:55') {
            congregation = '13:05'; // 1:05 PM
          } else {
            congregation = '13:00'; // 1:00 PM
          }
        } else {
          congregation = addMinutesToTime(callToPrayer, 10); // 10 minutes after adhan for other prayers
        }
        
        return {
          name: key,
          displayName,
          callToPrayer,
          congregation,
        };
      } catch (error) {
        console.error(`Error getting time for ${key}:`, error);
        throw new Error(`Failed to get time for ${key}`);
      }
    });
    
    return prayers;
  } catch (error) {
    console.error('Error in getPrayerTimes:', error);
    throw error; // Re-throw to be caught by the outer try-catch
  }
};

export const getTodaysPrayerTimes = (): PrayerTime[] => {
  try {
    return getPrayerTimes();
  } catch (error) {
    console.error('Error calculating prayer times, falling back to default schedule', error);
    // Fallback to the original schedule if there's an error
    return [
      { name: 'fajr', displayName: 'Fajr', callToPrayer: '05:15', congregation: '05:25' },
      { name: 'dhuhr', displayName: 'Dhuhr', callToPrayer: '12:45', congregation: '13:00' }, // Updated to follow new logic
      { name: 'asr', displayName: 'Asr', callToPrayer: '15:45', congregation: '15:55' },
      { name: 'maghrib', displayName: 'Maghrib', callToPrayer: '18:32', congregation: '18:42' },
      { name: 'isha', displayName: 'Isha', callToPrayer: '19:55', congregation: '20:05' },
      { name: 'jumuah', displayName: "Jumu'ah", callToPrayer: '13:00', congregation: '13:30' },
    ];
  }
};
