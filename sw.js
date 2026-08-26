const C='mylingo-v3';
const CORE=['./','./index.html','./quizzes.json','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(C).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const u=new URL(event.request.url);
  if(u.origin!==location.origin) return;
  const dynamic=(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/quizzes.json')||u.pathname.endsWith('.html')||u.pathname.endsWith('.js')||u.pathname.endsWith('.webmanifest'));
  if(dynamic){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response.ok) caches.open(C).then(c=>c.put(event.request,response.clone()));
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok) caches.open(C).then(c=>c.put(event.request,response.clone()));
    return response;
  })));
});
