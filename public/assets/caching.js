export const ifCacheRespond = async (request, context, event) => {
  const response = await caches.match(request);
  if (response) {
    return response
  }
}

const putInCache = async (request, response) => {
  const cache = await caches.open("v2");
  await cache.put(request, response);
}

export const cacheFirst = async (_request, context, event) => {
  const request = _request.clone()
  console.log("cacheFirst", request.url)

  const cachedResponse = await caches.match(event.request);
  if (cachedResponse) return cachedResponse;

  // Else, use the preloaded response, if it's there
  const response = await event.preloadResponse;
  if (response) return response;

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    console.info("fetched response from network", responseFromNetwork);
    event.waitUntil(putInCache(request, responseFromNetwork.clone()));
    return responseFromNetwork;
  } catch (error) {
    return new Response("Network error happened", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}