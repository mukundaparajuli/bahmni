// Browser cache clearing utility for PDF worker issues
// Run this in browser console if PDF worker errors persist

console.log('🔧 Clearing PDF.js related cache...');

// Clear service worker cache if present
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✓ Service worker unregistered');
    }
  });
}

// Clear browser cache storage
if ('caches' in window) {
  caches.keys().then(function(names) {
    names.forEach(function(name) {
      caches.delete(name);
      console.log('✓ Cache deleted:', name);
    });
  });
}

// Clear local storage
localStorage.clear();
console.log('✓ Local storage cleared');

// Clear session storage
sessionStorage.clear();
console.log('✓ Session storage cleared');

console.log('🎉 Cache clearing complete! Please refresh the page.');
console.log('💡 If issues persist, try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');