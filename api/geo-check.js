export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  // Get geolocation from Vercel headers
  const country = request.headers.get('x-vercel-ip-country') || '';
  const region = request.headers.get('x-vercel-ip-region') || '';

  // Only block if we're certain they're NOT in Arizona
  // If we have US country code but region is not AZ, block
  // Otherwise allow (including when geo data is unavailable)
  const isDefinitelyNotArizona = country === 'US' && region && region !== 'AZ';

  const allowed = !isDefinitelyNotArizona;

  return new Response(
    JSON.stringify({
      allowed,
      country,
      region,
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
