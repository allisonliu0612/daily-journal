const CACHE='stardust-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const MSGS=['今天過得怎麼樣?寫下三件感恩的事吧。','睡前花一分鐘,為今天留下一點光。','今天有什麼值得感謝的小事?','翻開 Stardust,寫下今天的顯化語。','把今天的好事記下來,明天會更輕盈。','一天結束了,來和自己說說話。','感恩三件事,顯化一句話。','晚安之前,給今天一個溫柔的收尾。'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))));
});
self.addEventListener('push',e=>{
  const now=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Taipei'}));
  const day=Math.floor((now-new Date(now.getFullYear(),0,0))/86400000);
  let body=MSGS[day%MSGS.length];
  if(now.getDate()===1)body+='\n新的一個月,順便備份一下資料吧。';
  e.waitUntil(self.registration.showNotification('Stardust',{body,icon:'./icon-192.png',badge:'./icon-192.png',tag:'stardust-daily',data:{url:'./?write=today'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if('focus' in c){c.postMessage({type:'write-today'});return c.focus()}}
    return self.clients.openWindow(url);
  }));
});
