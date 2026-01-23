export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  // Get geolocation from Vercel headers
  const country = request.headers.get('x-vercel-ip-country') || '';
  const region = request.headers.get('x-vercel-ip-region') || '';

  // Check if user is in Arizona
  const isArizona = country === 'US' && region === 'AZ';

  // Allow in development (no geo headers)
  const isDevelopment = !country && !region;

  const allowed = isArizona || isDevelopment;

  return new Response(
    JSON.stringify({
      allowed,
      country,
      region,
      debug: isDevelopment ? 'development mode' : `${country}-${region}`,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
