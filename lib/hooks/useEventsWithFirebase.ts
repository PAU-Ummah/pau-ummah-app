"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@/types';

export function useEventsWithFirebase() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    // Check if Firebase is configured
    if (!db) {
      console.log('❌ useEventsWithFirebase: Firebase db is null/undefined');
      setError('Firebase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const eventsData: Event[] = [];
          snapshot.forEach((doc) => {
            eventsData.push({ id: doc.id, ...doc.data() } as Event);
          });
          setEvents(eventsData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('❌ useEventsWithFirebase: Error fetching events:', err);
          setError('Failed to fetch events');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('❌ useEventsWithFirebase: Error setting up Firebase listener:', err);
      setError('Failed to connect to Firebase');
      setLoading(false);
    }
  }, []);

  return { events, loading, error };
}
