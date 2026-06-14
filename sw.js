const CACHE='eon-v1';
const ASSETS=[
  '/eon-levelez-/',
  '/eon-levelez-/index.html',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
];
self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))
));
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('googleapis.com')||e.request.url.includes('google.com'))return;
  e.respondWith(
    fetch(e.request).catch(()=>caches.match(e.request))
  );
});
