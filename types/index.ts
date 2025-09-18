export interface NavigationItem {
  label: string;
  href: string;
}

export interface PrayerTime {
  name: string;
  displayName?: string;
  callToPrayer: string;
  congregation: string;
  iqamah?: string;
}

export interface PrayerSchedule extends PrayerTime {
  date?: string;
}

export interface WhatWeDoItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaLabel: string;
  href: string;
}

export type EventCategory =
  | "education"
  | "spiritual"
  | "community"
  | "charity"
  | "youth"
  | "volunteering";

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: EventCategory;
  description: string;
  registrationLink?: string;
  featured?: boolean;
}

export interface UpcomingEvent extends EventItem {
  recurring?: string;
  highlights?: string[];
}

export interface PastEvent extends EventItem {
  galleryLink?: string;
  highlightVideo?: string;
}

export type MediaType = "video" | "image";

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  date: string;
  eventType: EventCategory | "general";
  likes: number;
  views: number;
  author?: string;
  duration?: number;
  tags?: string[];
}

export interface MediaFeedResponse {
  items: MediaItem[];
  nextPageToken?: string;
  total?: number;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar?: string;
  message: string;
  timestamp: string;
  likes?: number;
  replies?: CommentItem[];
}

export interface CountdownState {
  currentPrayer?: PrayerSchedule;
  nextPrayer?: PrayerSchedule;
  timeUntilNext?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  progress?: number;
}

export interface PrayerMeta {
  location: string;
  date: string;
  calculationMethod: string;
}

export interface PrayerScheduleResponse {
  meta: PrayerMeta;
  schedule: PrayerSchedule[];
}
