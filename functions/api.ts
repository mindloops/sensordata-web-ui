export async function onRequest(context) {
  // rewrite the reuqest's URL to a fixed value.
  // you could also use an environment variable.
  const apiUrl = new URL("https://api-samenmeten.rivm.nl/v1.0");

  const requestUrl = new URL(context.request.url);
  // remove the /api prefix
  apiUrl.pathname = requestUrl.pathname.replace(/^\/api/, '');
  apiUrl.search = requestUrl.search;

  // proxy the request to the API backend.
  const request = new Request(apiUrl, context.request);
  return fetch(request);
};
