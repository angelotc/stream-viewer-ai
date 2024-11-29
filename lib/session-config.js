export const sessionConfig = {
  password: process.env.SESSION_PASSWORD,
  cookieName: 'twitch_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}; 