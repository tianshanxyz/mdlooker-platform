// MDLooker Service Worker
// 提供离线缓存和推送通知支持

const CACHE_NAME = 'mdlooker-v1';
const STATIC_ASSETS = [
  '/',
  '/mobile',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 拦截请求并提供缓存
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }

  // API请求使用网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 缓存成功的API响应
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络失败时返回缓存
          return caches.match(request);
        })
    );
    return;
  }

  // 静态资源使用缓存优先策略
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        // 返回缓存并后台更新
        fetch(request).then((fetchResponse) => {
          if (fetchResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, fetchResponse);
            });
          }
        }).catch(() => {});
        return response;
      }

      // 缓存未命中，从网络获取
      return fetch(request).then((fetchResponse) => {
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }

        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return fetchResponse;
      });
    })
  );
});

// 推送通知
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MDLooker', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  let url = '/mobile';

  if (notificationData.url) {
    url = notificationData.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // 如果已有窗口打开，聚焦并导航
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // 否则打开新窗口
      if (self.clients.openWindow) {
        self.clients.openWindow(url);
      }
    })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  } else if (event.tag === 'sync-search-history') {
    event.waitUntil(syncSearchHistory());
  }
});

// 同步收藏数据
async function syncFavorites() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/mobile/user/favorites')) {
        const response = await cache.match(request);
        if (response) {
          // 尝试重新同步到服务器
          try {
            await fetch(request, {
              method: 'POST',
              body: await response.text(),
              headers: {
                'Content-Type': 'application/json',
              },
            });
            await cache.delete(request);
          } catch (e) {
            console.error('Sync failed:', e);
          }
        }
      }
    }
  } catch (e) {
    console.error('Sync favorites error:', e);
  }
}

// 同步搜索历史
async function syncSearchHistory() {
  // 类似 syncFavorites 的实现
}

// 消息处理（来自主线程）
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
