import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Returns 200 OK if the service is running
 * Used by deployment platforms (Vercel, Railway) for health monitoring
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: '12-step-companion-web',
    },
    { status: 200 }
  );
}

