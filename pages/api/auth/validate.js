import { getIronSession } from 'iron-session';

// Add the same session config as in callback.js
const sessionConfig = {
  password: process.env.SESSION_PASSWORD,
  cookieName: 'twitch_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionConfig);
  console.log('Session in validate:', {
    hasUser: !!session.user,
    userId: session.user?.id,
    hasAccessToken: !!session.user?.accessToken
  });
  const access_token = session.user?.accessToken;

  console.log('Received access token:', access_token?.substring(0, 10) + '...');

  if (!access_token) {
    return res.status(401).json({ error: 'No access token found' });
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    console.log('Twitch validation status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Twitch validation error:', errorData);
      throw new Error(`Invalid token - Status: ${response.status}`);
    }

    const data = await response.json();
    
    res.status(200).json({
      authenticated: true,
      user: {
        id: data.user_id,
        login: data.login,
        clientId: data.client_id,
        scopes: data.scopes
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(401).json({ 
      authenticated: false, 
      error: error.message 
    });
  }
} 