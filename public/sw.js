import { html, render } from './assets/uhtml-ssr-0.9.1/es.js'
import ContactDatabase from './assets/db/contacts.js';
import router from './assets/routes.js'

const currentCacheVersion = 'v3'
const cacheName = `htmx-sw-${currentCacheVersion}`
const cacheAssets = [
    '/assets/db/sql-wasm.wasm',
    '/assets/db/sql-wasm.js',
    '/assets/db/initSqlite.js',
    '/assets/db/contacts.js',
    '/assets/htmx.org-1.9.12/dist/htmx.min.js',
    '/assets/itty-router-5.0.18/index.js',
    '/assets/uhtml-ssr-0.9.1/es.js',
    '/icons/contact-logo.svg',
    '/manifest.json',
]


const log = console.log;
const error = console.error;


const addResourcesToCache = async (resources) => {
    const cache = await caches.open(cacheName)
    await cache.addAll(resources)
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache(cacheAssets)
            .then(() => {
               log("Service worker installed and resources cached.")
            })
            .catch((err) => {
                error("Error caching resources:", err)
            })
    )
})

const deleteCache = async (key) => {
    await caches.delete(key)
}

const deleteOldCaches = async () => {
    log('deleteOldCaches')
    const cacheKeepList = [cacheName]
    const keyList = await caches.keys()
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key))
    await Promise.all(cachesToDelete.map(deleteCache))
}

self.addEventListener('activate', event => {
    event.waitUntil(async function() {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await deleteOldCaches()
    }());
  });

let db = null

self.addEventListener('fetch', async (event) => {
    event.respondWith((async () => {
        try {
            if (!db) {
                db = new ContactDatabase('contacts.sqlite')
                await db.init()
            }
        } catch (e) {
            error(e)
        }
        return router.fetch(event.request, { render, html, db, onLine: navigator.onLine }, event)
    })())
})
