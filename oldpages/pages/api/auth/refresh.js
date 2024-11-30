import { PrismaClient } from '@prisma/client';
import { encrypt } from '../../../utils/encryption'; // You'll need this from earlier

const prisma = new PrismaClient();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

export async function refreshTwitchToken(refreshToken) {
  try {
    // Exchange refresh token for new access token
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    // Calculate new expiration time
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    // Update tokens in database
    await prisma.session.update({
      where: {
        refreshToken: encrypt(refreshToken)
      },
      data: {
        accessToken: encrypt(data.access_token),
        refreshToken: encrypt(data.refresh_token),
        expiresAt
      }
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

// Optional: Add an API route handler if you want to manually refresh
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const newTokens = await refreshTwitchToken(refreshToken);
    res.status(200).json(newTokens);
  } catch (error) {
    console.error('Refresh handler error:', error);
    res.status(500).json({ error: error.message });
  }
} 