// Offline-cache. Vite geeft assets een hash, dus de app-shell wordt per deploy vervangen.
const CACHE='opstellingen-shell-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/manifest.json','/icon.svg'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.pathname.startsWith('/rest/')||u.hostname.endsWith('supabase.co'))return;
  if(u.origin===location.origin&&e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{caches.open(CACHE).then(c=>c.put('/index.html',r.clone()));return r}).catch(()=>caches.match('/index.html')));return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return res}).catch(()=>new Response('',{status:503}))));
});
