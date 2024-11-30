import { getIronSession } from 'iron-session';
import { sessionConfig } from '../../../lib/session-config';
import { refreshTwitchToken } from '../auth/refresh';

// Higher-order function that combines iron-session with our auth check
export function withAuth(handler) {
  return async (req, res) => {
    const session = await getIronSession(req, res, sessionConfig);

    // Check if user is authenticated
    if (!session.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Please login to access this endpoint' 
      });
    }

    // Check if token needs refreshing
    if (isTokenExpired(session.user.expiresAt)) {
      try {
        const newTokens = await refreshTwitchToken(session.user.refreshToken);
        session.user = {
          ...session.user,
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: newTokens.expiresAt
        };
        await session.save();
      } catch (error) {
        // If refresh fails, force re-login
        session.destroy();
        return res.status(401).json({ 
          error: 'Token expired',
          message: 'Please login again' 
        });
      }
    }

    // Add session to request for handler to use
    req.session = session;

    // If authenticated and token is valid, proceed to the actual handler
    return handler(req, res);
  };
}

function isTokenExpired(expiresAt) {
  // Add some buffer (e.g., 5 minutes) to ensure we refresh before actual expiration
  const bufferMs = 5 * 60 * 1000;
  return new Date(expiresAt).getTime() - bufferMs < Date.now();
} 