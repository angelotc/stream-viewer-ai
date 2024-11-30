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

    // Get user info from Twitch
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    const userData = await userResponse.json();
    
    if (!userData.data?.[0]) {
      throw new Error('Invalid user data received from Twitch');
    }

    const twitchUser = userData.data[0];

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { id: twitchUser.id },
      update: {
        login: twitchUser.login,
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
        email: twitchUser.email,
      },
      create: {
        id: twitchUser.id,
        login: twitchUser.login,
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
        email: twitchUser.email,
      },
    });

    // Create or update session
    const dbSession = await prisma.session.upsert({
      where: { userId: user.id },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
      create: {
        userId: user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    // Store user data in iron session
    session.user = {
      id: user.id,
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

    // Redirect back to the app with success
    res.redirect('/?login=success');
  } catch (error) {
    // Use proper server-side error logging
    console.log('[Auth Error]', error instanceof Error ? error.message : 'Unknown error');
    
    // Redirect with error
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    res.redirect('/login?error=' + encodeURIComponent(errorMessage));
  }
} 