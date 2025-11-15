import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Auth endpoint - always returns null (no auth in standalone mode)
 * This allows the app to work without authentication
 */
export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Always return null - app works without authentication
  return res.json(null);
}

