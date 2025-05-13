import { html, render } from 'https://cdn.jsdelivr.net/npm/uhtml-ssr@0.9.1/+esm'
import ContactDatabase from '/assets/db/contacts.js';
import router from '/assets/routes.js'

const currentCacheVersion = 'v2'
const cacheName = `htmx-sw-${currentCacheVersion}`
const cacheAssets = [
    '/assets/db/sql-wasm.wasm',
    '/assets/db/sql-wasm.js',
    '/assets/db/initSqlite.js',
    '/assets/db/contacts.js',
    '/assets/htmx.org@1.9.12/dist/htmx.min.js',
    '/assets/itty-router@5.0.18/index.js',
    '/assets/uhtml-ssr@0.9.1/es.js',
]

globalThis.log = console.log;
globalThis.error = console.error;


const addResourcesToCache = async (resources) => {
    const cache = await caches.open(cacheName)
    await cache.addAll(resources)
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache(cacheAssets)
            .then(() => {
                console.log("Service worker installed and resources cached.")
            })
            .catch((error) => {
                console.error("Error caching resources:", error)
            })
    )
})

const deleteCache = async (key) => {
    await caches.delete(key)
}

const deleteOldCaches = async () => {
    console.log('deleteOldCaches')
    const cacheKeepList = [cacheName]
    const keyList = await caches.keys()
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key))
    await Promise.all(cachesToDelete.map(deleteCache))
}

addEventListener('activate', event => {
    event.waitUntil(async function() {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await deleteOldCaches()
    }());
  });

self.addEventListener("activate", (event) => {
    event.waitUntil(

        deleteOldCaches(),
    )
})

let db = null
self.addEventListener('fetch', async (event) => {
    event.respondWith((async () => {
        try {
            if (!db) {
                db = new ContactDatabase('contacts.sqlite')
                await db.init()
            }
        } catch (e) {
            console.error(e)
        }
        return router.fetch(event.request, { render, html, db, onLine: navigator.onLine }, event)
    })())
})
