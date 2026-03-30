import { NextResponse } from 'next/server';

export function GET() {
  // Return a 1x1 transparent GIF as favicon
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  
  return new NextResponse(gif, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
