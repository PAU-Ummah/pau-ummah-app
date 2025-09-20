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
  { label: "What We Do", href: "#services" },
  { label: "Past Events", href: "#past-events" },
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

export const WHAT_WE_DO_ITEMS: WhatWeDoItem[] = [
  {
    id: "spiritual-growth",
    title: "Daily Congregational Prayers",
    description:
      "Join our vibrant community for all five daily prayers alongside inspiring reminders and supplications.",
    icon: "moon-star",
    ctaLabel: "View prayer schedule",
    href: "#prayer-times",
  },
  {
    id: "education",
    title: "Knowledge Circles",
    description:
      "Weekly halaqahs, tafsir sessions, and seminars with scholars that nurture sound Islamic understanding.",
    icon: "book-open",
    ctaLabel: "Explore learning",
    href: "#upcoming-events",
  },
  {
    id: "community",
    title: "Community Service",
    description:
      "Volunteer-driven programmes that empower the Ummah through social impact, mentorship, and charity.",
    icon: "users",
    ctaLabel: "Join the team",
    href: "#contact",
  },
  {
    id: "wellness",
    title: "Student Wellbeing",
    description:
      "Peer support, counselling referrals, and recreation nights that keep students energised and connected.",
    icon: "heart",
    ctaLabel: "Discover resources",
    href: "#about",
  },
];

// Removed EVENT_CATEGORIES, UPCOMING_EVENTS, PAST_EVENTS in favor of Drive-powered dynamic content

// FEATURED_MEDIA and STORIES_PREVIEWS removed in favor of dynamic Drive-powered content

export const MEDIA_FILTERS: { label: string; value: EventCategory | "all" }[] = [
  { label: "For You", value: "all" },
  { label: "Community", value: "community" },
  { label: "Knowledge", value: "education" },
  { label: "Spiritual", value: "spiritual" },
  { label: "Youth", value: "youth" },
  { label: "Charity", value: "charity" },
];
