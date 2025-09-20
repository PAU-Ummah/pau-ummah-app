// This function registers the service worker in the browser
export function registerServiceWorker() {
  // Only run in the browser
  if (typeof window === 'undefined') return;
  
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
      
      // Register the service worker
      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update().catch(err => 
              console.log('ServiceWorker update check failed:', err)
            );
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}

// This function unregisters the service worker (useful during development)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
