// Verziószám – növeld feltöltéskor, hogy a böngésző biztosan frissítsen
const CACHE='eon-v2';
const ASSETS=[
  './',
  './index.html',
  './manifest.json'
];

// Telepítéskor: új cache feltöltése + azonnali aktiválás
self.addEventListener('install',e=>{
  self.skipWaiting(); // ne várjon a régi lezárására
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{}))
  );
});

// Aktiváláskor: régi cache-ek törlése + azonnali átvétel
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

// Fetch stratégia:
// - Google API hívások: SOHA ne cache-eljük (mindig friss)
// - index.html / navigáció: NETWORK FIRST (mindig a legfrissebb, offline esetén cache)
// - egyéb statikus: cache, de háttérben frissít
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  if(url.includes('googleapis.com')||url.includes('google.com')||url.includes('gstatic.com'))return;

  // HTML / navigáció → mindig próbáljon hálózatról, hogy a legújabb verzió jöjjön
  if(e.request.mode==='navigate'||url.endsWith('/')||url.endsWith('index.html')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return r;
      }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  // Egyéb (pl. ikonok CDN) → cache, ha nincs akkor hálózat
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
