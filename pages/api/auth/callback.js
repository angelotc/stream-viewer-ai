import { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import prisma from '../../../lib/prisma';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

// Iron session configuration
const sessionConfig = {
  password: process.env.SESSION_PASSWORD, // at least 32 chars
  cookieName: 'twitch_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionConfig);
  
  // Clear existing session data first
  session.user = undefined;
  await session.save();

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.message);
    }

    // Get user info
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    const userData = await userResponse.json();
    console.log('userData', userData);
    // Validate user data
    if (!userData.data?.[0]) {
      throw new Error('Invalid user data received from Twitch');
    }

    // First try to find existing session
    const existingSession = await prisma.session.findFirst({
      where: {
        userId: userData.data[0].id
      }
    });

    // Update or create session
    const dbSession = existingSession 
      ? await prisma.session.update({
          where: {
            id: existingSession.id  // Using the unique id field
          },
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          },
        })
      : await prisma.session.create({
          data: {
            userId: userData.data[0].id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
          },
        });

    // Store user data in iron session
    session.user = {
      id: userData.data[0].id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000)
    };
    await session.save();
    
    // Add debug logging
    console.log('Session saved:', {
      userId: session.user.id,
      hasAccessToken: !!session.user.accessToken,
      expiresAt: session.user.expiresAt
    });

    // Add more detailed logging
    console.log('Auth success:', {
      userId: userData.data[0].id,
      tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
    });

    // Redirect back to the app with success
    res.redirect('/?login=success');
  } catch (error) {
    // Clear session on error
    session.user = undefined;
    await session.save();
    
    console.error('Auth error:', error);
    res.redirect('/login?error=' + encodeURIComponent(error.message));
  }
} 