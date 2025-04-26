const API_URL = 'https://api-samenmeten.rivm.nl/v1.0';

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const onRequest = async (context) => {
  console.log(`[LOGGING FROM /api]: Request came from ${context.request.url}`)

  const immutableResponse = await fetch(
    new Request(API_URL, context.request),
  );

  const response = new Response(immutableResponse.body, immutableResponse);

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
};
