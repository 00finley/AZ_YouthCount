export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  // Get geolocation from Vercel headers
  const country = request.headers.get('x-vercel-ip-country') || '';
  const region = request.headers.get('x-vercel-ip-region') || '';

  // Check if Arizona
  const isArizona = country === 'US' && region === 'AZ';

  // Allow if:
  // 1. In Arizona
  // 2. No geo data available (development/edge cases)
  const noGeoData = !country;
  const allowed = isArizona || noGeoData;

  // Reason for blocking (for debugging)
  let reason = '';
  if (!allowed) {
    if (country !== 'US') {
      reason = 'outside_us';
    } else if (region !== 'AZ') {
      reason = 'outside_az';
    }
  }

  return new Response(
    JSON.stringify({
      allowed,
      reason,
      debug: `${country}-${region}`,
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
