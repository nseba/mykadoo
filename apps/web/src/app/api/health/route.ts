import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker and Kubernetes
 * Returns 200 OK if the application is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mykadoo-web',
    },
    { status: 200 }
  );
}
