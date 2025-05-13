const putInCache = async (request, response) => {
  const cache = await caches.open("v2");
  await cache.put(request, response);
}

export const cacheFirst = async (_request, context, event) => {
  const request = _request.clone()
  const cachedResponse = await caches.match(event.request);
  if (cachedResponse) return cachedResponse;

  const response = await event.preloadResponse;
  if (response) return response;

  try {
    const responseFromNetwork = await fetch(request);
    event.waitUntil(putInCache(request, responseFromNetwork.clone()));
    return responseFromNetwork;
  } catch (error) {
    return new Response("Network error happened", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}