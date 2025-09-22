"use client";

import { useMemo } from "react";
import { AnimatedCard } from "@/components/mosque/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import { useEventsWithFirebase } from "@/lib/hooks/useEventsWithFirebase";
import type { Event } from "@/types";

interface EventWithStatus extends Event {
  status: 'upcoming' | 'today' | 'started' | 'soon' | 'ended';
  timeUntilStart?: number;
  timeUntilEnd?: number;
}

export function UpcomingEvents() {
  const { events, loading, error } = useEventsWithFirebase();

  const upcomingEvents = useMemo(() => {
    
    if (!events.length) {
      return [];
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    

    return events
      .map((event): EventWithStatus => {
        const eventDate = new Date(event.date);
        const eventStartTime = event.startTime ? new Date(event.startTime) : null;
        const eventEndTime = event.endTime ? new Date(event.endTime) : null;

        // Check if event is today
        const isToday = eventDate.toDateString() === today.toDateString();
        
        // Check if event has started
        const hasStarted = eventStartTime ? now >= eventStartTime : false;
        
        // Check if event has ended
        const hasEnded = eventEndTime ? now >= eventEndTime : false;
        
        // Check if event is within 7 days
        const isSoon = eventDate >= today && eventDate <= sevenDaysFromNow;

        let status: EventWithStatus['status'] = 'upcoming';
        
        if (hasEnded) {
          status = 'ended';
        } else if (hasStarted) {
          status = 'started';
        } else if (isToday) {
          status = 'today';
        } else if (isSoon) {
          status = 'soon';
        }

        return {
          ...event,
          status,
          timeUntilStart: eventStartTime ? eventStartTime.getTime() - now.getTime() : undefined,
          timeUntilEnd: eventEndTime ? eventEndTime.getTime() - now.getTime() : undefined,
        };
      })
      .filter((event) => event.status !== 'ended') // Remove ended events
      .sort((a, b) => {
        // Sort by date, then by start time
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        
        if (a.startTime && b.startTime) {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        
        return 0;
      });
  }, [events]);


  const getStatusBadge = (status: EventWithStatus['status']) => {
    switch (status) {
      case 'today':
        return <Badge className="bg-blue-100 text-blue-800">Today</Badge>;
      case 'started':
        return <Badge className="bg-green-100 text-green-800">Started</Badge>;
      case 'soon':
        return <Badge className="bg-orange-100 text-orange-800">Soon</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">Upcoming</Badge>;
    }
  };

  const formatEventTime = (event: EventWithStatus) => {
    if (event.startTime) {
      const startTime = new Date(event.startTime);
      return startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return null;
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <section id="upcoming-events" className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">
              Upcoming Events
            </p>
            <h2 className="text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
              What&apos;s happening next
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              Stay connected with our upcoming gatherings, programs, and community events.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-12 md:gap-6">
            {Array.from({ length: 3 }).map((_, index: number) => (
              <AnimatedCard key={index} delay={index * 120} loading>
                <div className="h-48 w-full rounded-2xl bg-slate-200" />
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="upcoming-events" className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">
              Upcoming Events
            </p>
            <h2 className="text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
              What&apos;s happening next
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              Stay connected with our upcoming gatherings, programs, and community events.
            </p>
          </div>

          <div className="mt-10 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Unable to load events</h3>
              <p className="mt-2 text-sm text-slate-600">
                {error.includes('Firebase is not configured') 
                  ? 'Firebase configuration is missing. Please check your environment variables.'
                  : 'Please try again later or contact support if the issue persists.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="upcoming-events" className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">
            Upcoming Events
          </p>
          <h2 className="text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
            What&apos;s happening next
          </h2>
          <p className="max-w-2xl text-base text-slate-600">
            Stay connected with our upcoming gatherings, programs, and community events.
          </p>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="mt-10 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No events scheduled yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Check back soon for upcoming community events and programs.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-12 md:gap-6">
            {upcomingEvents.map((event, index) => (
              <AnimatedCard key={event.id} delay={index * 120} loading={false}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    {getStatusBadge(event.status)}
                  </div>
                  
                  <h3 className="mb-2 text-lg font-semibold text-[var(--brand-primary)]">
                    {event.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    
                    {formatEventTime(event) && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{formatEventTime(event)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
