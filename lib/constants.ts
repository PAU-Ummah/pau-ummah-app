import type {
  EventCategory,
  NavigationItem,
  PrayerSchedule,
  WhatWeDoItem,
} from "@/types";

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Prayer Times", href: "#prayer-times" },
  { label: "Past Events", href: "#past-events" },
  { label: "Upcoming Events", href: "#upcoming-events" },
  { label: "Contact", href: "#contact" },
];

export const PRAYER_SCHEDULE: PrayerSchedule[] = [
  {
    name: "fajr",
    displayName: "Fajr",
    callToPrayer: "05:15",
    congregation: "05:35",
  },
  {
    name: "dhuhr",
    displayName: "Dhuhr",
    callToPrayer: "12:45",
    congregation: "13:15",
  },
  {
    name: "asr",
    displayName: "Asr",
    callToPrayer: "15:45",
    congregation: "16:00",
  },
  {
    name: "maghrib",
    displayName: "Maghrib",
    callToPrayer: "18:32",
    congregation: "18:35",
  },
  {
    name: "isha",
    displayName: "Isha",
    callToPrayer: "19:55",
    congregation: "20:10",
  },
  {
    name: "jumuah",
    displayName: "Jumu'ah",
    callToPrayer: "13:00",
    congregation: "13:30",
  },
];


// FEATURED_MEDIA and STORIES_PREVIEWS removed in favor of dynamic Drive-powered content

export const MEDIA_FILTERS: { label: string; value: EventCategory | "all" }[] = [
  { label: "For You", value: "all" },
  { label: "Community", value: "community" },
  { label: "Knowledge", value: "education" },
  { label: "Spiritual", value: "spiritual" },
  { label: "Youth", value: "youth" },
  { label: "Charity", value: "charity" },
];
