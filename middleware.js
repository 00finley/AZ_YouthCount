export const config = {
  matcher: '/register',
};

export default function middleware(request) {
  // Get the region from Vercel's geolocation headers
  const country = request.headers.get('x-vercel-ip-country');
  const region = request.headers.get('x-vercel-ip-region');

  // Allow access if from Arizona (US-AZ) or if geo headers aren't available (localhost/dev)
  const isArizona = country === 'US' && region === 'AZ';
  const isDevelopment = !country && !region;

  if (isArizona || isDevelopment) {
    return;
  }

  // Redirect non-Arizona visitors to the home page
  const url = new URL('/', request.url);
  url.searchParams.set('restricted', 'geo');

  return Response.redirect(url.toString(), 302);
}
