// based upon https://kerkour.com/cloudflare-pages-workers-cors-proxy

export async function onRequest(context: any) {
  const endpoint = new URL("https://api-samenmeten.rivm.nl/");

  const requestUrl = new URL(context.request.url);
  // remove the /api prefix
  const path = requestUrl.pathname.replace(/^\/api/, '');
  endpoint.pathname = "v1.0" + path
  endpoint.search = requestUrl.search;

  // proxy the request to the STA backend.
  const request = new Request(endpoint, context.request);
  return fetch(request);
}
