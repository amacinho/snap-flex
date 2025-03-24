console.log('Register Service Worker: loaded');
if('serviceWorker' in navigator) 
    console.log('Register Service Worker: registered');
    navigator.serviceWorker.register(
        '/snap-flex/sw.js', 
    { scope: '/snap-flex/', type: 'classic' }
)