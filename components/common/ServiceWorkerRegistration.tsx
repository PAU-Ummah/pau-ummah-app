'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/registerServiceWorker';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
  }, []);

  return null;
}
