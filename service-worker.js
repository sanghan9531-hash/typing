// 앱을 인터넷 없이도 켤 수 있게 파일을 휴대폰에 저장해 두는 코드예요.
// ★ index.html을 고쳐서 다시 올릴 때는 아래 버전 숫자를 하나 올려 주세요 (v1 → v2).
//   그래야 사용자 휴대폰에 새 버전이 들어가요.
const VERSION = "typing-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

// 처음 설치될 때 파일 저장
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

// 새 버전이 오면 옛날 저장본 지우기
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 파일 요청이 오면: 인터넷이 되면 새로 받아서 저장, 안 되면 저장본 사용
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
  );
});
