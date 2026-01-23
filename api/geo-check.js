export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  // Get geolocation from Vercel headers
  const country = request.headers.get('x-vercel-ip-country') || '';
  const region = request.headers.get('x-vercel-ip-region') || '';

  // Allow if:
  // 1. In the US (any state - mobile carriers don't reliably report state)
  // 2. No geo data available (development/edge cases)
  const isUS = country === 'US';
  const noGeoData = !country;
  const allowed = isUS || noGeoData;

  // Reason for blocking (for debugging)
  let reason = '';
  if (!allowed) {
    reason = 'outside_us';
  }

  return new Response(
    JSON.stringify({
      allowed,
      reason,
      country,
      region,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
