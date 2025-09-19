import { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInSeconds, isAfter, isBefore } from 'date-fns';
import type { CountdownState, PrayerSchedule } from '@/types';
import { getTodaysPrayerTimes } from '../prayerTimes';

const TIME_FORMAT = 'HH:mm';

const parsePrayerTime = (time: string, reference: Date) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(reference);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const buildScheduleWithDates = (schedule: PrayerSchedule[], reference: Date) =>
  schedule.map((item) => ({
    ...item,
    date: parsePrayerTime(item.callToPrayer, reference).toISOString(),
  }));

export interface UsePrayerTimesReturn {
  state: CountdownState;
  todaysSchedule: PrayerSchedule[];
  scheduleWithDates: Array<PrayerSchedule & { date: string }>;
}

export const usePrayerTimes = (staticSchedule: PrayerSchedule[]): UsePrayerTimesReturn => {
  const [state, setState] = useState<CountdownState>({});
  
  // Get today's prayer times (calculated dynamically)
  const todaysSchedule = useMemo(() => {
    try {
      return getTodaysPrayerTimes();
    } catch (error) {
      console.error('Error getting prayer times, falling back to static schedule', error);
      return staticSchedule;
    }
  }, [staticSchedule]);

  const scheduleWithDates = useMemo(
    () => buildScheduleWithDates(todaysSchedule, new Date()),
    [todaysSchedule]
  );


  useEffect(() => {
    const updateState = () => {
      const now = new Date();
      
      // Create enhanced schedule with parsed dates
      const enhanced = todaysSchedule.map((item) => ({
        item,
        start: parsePrayerTime(item.callToPrayer, now),
        congregation: parsePrayerTime(item.congregation, now),
      }));


      // Find the current prayer time slot
      const currentEnhancedIndex = enhanced.findIndex((entry, index) => {
        const nextEntry = enhanced[index + 1];
        if (!nextEntry) {
          return isAfter(now, entry.start);
        }
        const isAfterStart = isAfter(now, entry.start);
        const isBeforeNext = isBefore(now, nextEntry.start);
        return isAfterStart && isBeforeNext;
      });

      // Find the next prayer time
      const nextEnhanced =
        enhanced.find((entry) => isAfter(entry.start, now)) ?? {
          // If no future prayer found today, use first prayer of next day
          item: todaysSchedule[0],
          start: addDays(parsePrayerTime(todaysSchedule[0].callToPrayer, now), 1),
          congregation: addDays(parsePrayerTime(todaysSchedule[0].congregation, now), 1),
        };

      // Get current prayer or previous day's last prayer if before Fajr
      const currentEnhanced =
        currentEnhancedIndex !== -1
          ? enhanced[currentEnhancedIndex]
          : {
              item: todaysSchedule[todaysSchedule.length - 1],
              start: addDays(
                parsePrayerTime(todaysSchedule[todaysSchedule.length - 1].callToPrayer, now),
                -1,
              ),
              congregation: addDays(
                parsePrayerTime(todaysSchedule[todaysSchedule.length - 1].congregation, now),
                -1,
              ),
            };

      const current = currentEnhanced.item;
      const next = nextEnhanced.item;
      const nextStart = nextEnhanced.start;
      const previousStart = currentEnhanced.start;

      // Calculate time until next prayer
      const secondsToNext = differenceInSeconds(nextStart, now);
      const totalWindow = differenceInSeconds(nextStart, previousStart);
      const progress = totalWindow > 0 ? 1 - secondsToNext / totalWindow : 0;

      const hours = Math.floor(secondsToNext / 3600);
      const minutes = Math.floor((secondsToNext % 3600) / 60);
      const seconds = secondsToNext % 60;

      setState({
        currentPrayer: current,
        nextPrayer: next,
        timeUntilNext: {
          hours,
          minutes,
          seconds,
        },
        progress: Math.max(0, Math.min(Number.isFinite(progress) ? progress : 0, 1)),
      });
    };

    updateState();
    const timer = setInterval(updateState, 1000);

    return () => clearInterval(timer);
  }, [todaysSchedule]);

  return { state, todaysSchedule, scheduleWithDates };
};
