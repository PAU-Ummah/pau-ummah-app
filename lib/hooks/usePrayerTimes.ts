import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  differenceInSeconds,
  format,
  isAfter,
  isBefore,
  parse,
} from "date-fns";
import type { CountdownState, PrayerSchedule } from "@/types";

const TIME_FORMAT = "HH:mm";

const parsePrayerTime = (time: string, reference: Date) =>
  parse(time, TIME_FORMAT, reference);

const buildScheduleWithDates = (schedule: PrayerSchedule[], reference: Date) =>
  schedule.map((item) => ({
    ...item,
    date: format(parsePrayerTime(item.callToPrayer, reference), "yyyy-MM-dd'T'HH:mm:ssXXX"),
  }));

export const usePrayerTimes = (schedule: PrayerSchedule[]) => {
  const [state, setState] = useState<CountdownState>({});

  const scheduleWithDates = useMemo(() => buildScheduleWithDates(schedule, new Date()), [schedule]);

  useEffect(() => {
    const updateState = () => {
      const now = new Date();
      const enhanced = schedule.map((item) => ({
        item,
        start: parsePrayerTime(item.callToPrayer, now),
        congregation: parsePrayerTime(item.congregation, now),
      }));

      const currentEnhancedIndex = enhanced.findIndex((entry, index) => {
        const nextEntry = enhanced[index + 1];
        if (!nextEntry) {
          return isAfter(now, entry.start);
        }
        return isAfter(now, entry.start) && isBefore(now, nextEntry.start);
      });

      const nextEnhanced =
        enhanced.find((entry) => isAfter(entry.start, now)) ?? {
          item: schedule[0],
          start: parsePrayerTime(schedule[0].callToPrayer, addDays(now, 1)),
          congregation: parsePrayerTime(schedule[0].congregation, addDays(now, 1)),
        };

      const currentEnhanced =
        currentEnhancedIndex !== -1
          ? enhanced[currentEnhancedIndex]
          : {
              item: schedule[schedule.length - 1],
              start: parsePrayerTime(
                schedule[schedule.length - 1].callToPrayer,
                addDays(now, -1),
              ),
              congregation: parsePrayerTime(
                schedule[schedule.length - 1].congregation,
                addDays(now, -1),
              ),
            };

      const current = currentEnhanced.item;
      const next = nextEnhanced.item;

      const nextStart = nextEnhanced.start;
      const previousStart = currentEnhanced.start;

      const secondsToNext = differenceInSeconds(nextStart, now);
      const totalWindow = differenceInSeconds(nextStart, previousStart);
      const progress = current && totalWindow > 0 ? 1 - secondsToNext / totalWindow : 0;

      const hours = Math.floor(secondsToNext / 3600);
      const minutes = Math.floor((secondsToNext % 3600) / 60);
      const seconds = secondsToNext % 60;

      setState({
        currentPrayer: current ?? schedule[0],
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
  }, [schedule]);

  return {
    state,
    scheduleWithDates,
  };
};
