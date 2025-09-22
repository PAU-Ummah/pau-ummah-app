"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCalendarSubscription } from '@/lib/hooks/useCalendarSubscription';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarSubscriptionProps {
  className?: string;
}

export function CalendarSubscription({ className }: CalendarSubscriptionProps) {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calendarAccess, setCalendarAccess] = useState<boolean | null>(null);
  
  const { 
    isSubscribing, 
    isSuccess, 
    error, 
    eventsCreated, 
    subscribeToPrayerTimes, 
    testCalendarAccess,
    resetState 
  } = useCalendarSubscription();

  // Set default date range (next 30 days)
  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextMonth.toISOString().split('T')[0]);
  }, []);

  // Test calendar access on component mount
  useEffect(() => {
    const testAccess = async () => {
      const hasAccess = await testCalendarAccess();
      setCalendarAccess(hasAccess);
    };
    testAccess();
  }, [testCalendarAccess]);

  const handleSubscribe = async () => {
    if (!startDate || !endDate) return;
    
    await subscribeToPrayerTimes({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetState();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={`bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/90 text-white ${className}`}
        disabled={calendarAccess === false}
      >
        <Calendar className="w-4 h-4 mr-2" />
        {calendarAccess === false ? 'Calendar Unavailable' : 'Subscribe'}
      </Button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--brand-primary)]">
                  Subscribe to Prayer Times
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ×
                </Button>
              </div>

              {calendarAccess === false && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Google Calendar access is not configured. Please contact the administrator.
                    </span>
                  </div>
                </div>
              )}

              {calendarAccess === null && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Checking calendar access...</span>
                  </div>
                </div>
              )}

              {calendarAccess === true && (
                <>
                  <p className="text-sm text-slate-600 mb-4">
                    Add prayer times to your Google Calendar with automatic reminders for Adhan and Iqamah.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent"
                        min={startDate}
                        max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      />
                    </div>

                    {startDate && endDate && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">
                          <strong>Date Range:</strong> {formatDate(startDate)} to {formatDate(endDate)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          This will create events for all prayer times in this period.
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{error}</span>
                        </div>
                      </div>
                    )}

                    {isSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Successfully created {eventsCreated} events in your Google Calendar!
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleSubscribe}
                        disabled={!startDate || !endDate || isSubscribing}
                        className="flex-1 bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/90"
                      >
                        {isSubscribing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding to Calendar...
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Subscribe
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCloseModal}
                        disabled={isSubscribing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
