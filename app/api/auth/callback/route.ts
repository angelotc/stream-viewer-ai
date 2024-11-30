import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import prisma from '../../../../lib/prisma';
import { TwitchEventSubService } from '../../../../lib/twitch-eventsub';

const TWITCH_CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'

// Iron session configuration
const sessionConfig = {
  password: process.env.SESSION_PASSWORD!, // at least 32 chars
  cookieName: 'twitch_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function GET(request: Request) {
  try {
    // Check environment variables first
    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET || !process.env.SESSION_PASSWORD) {
      console.error('Missing required environment variables:', {
        hasTwitchClientId: !!TWITCH_CLIENT_ID,
        hasTwitchClientSecret: !!TWITCH_CLIENT_SECRET,
        hasSessionPassword: !!process.env.SESSION_PASSWORD
      })
      return new NextResponse('Server configuration error: Missing required credentials', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return new NextResponse('Missing authorization code', {
        status: 400,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }

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
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      return new NextResponse('Failed to exchange code for token', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('User info fetch failed:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      })
      return new NextResponse('Failed to fetch user info', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }

    const userData = await userResponse.json()
    if (!userData.data?.[0]) {
      return new NextResponse('No user data received', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }

    const twitchUser = userData.data[0]

    try {
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
          isBotEnabled: true // Default value for new users
        },
      })

      // Subscribe to stream events if this is a new user or bot is enabled
      if (user.isBotEnabled) {
        try {
          await TwitchEventSubService.subscribeToStreamOnline(user.id)
        } catch (error) {
          console.error('Failed to subscribe to stream events:', error)
          // Don't throw error here, we still want to complete the auth flow
        }
      }

      // Create or update session in database
      await prisma.session.upsert({
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
      })

      // Set session using iron-session
      const cookieStore = await cookies()
      const session = await getIronSession(cookieStore, sessionConfig)
      
      session.user = {
        id: user.id,
        accessToken: tokenData.access_token,
        login: user.login,
        displayName: user.displayName,
        email: user.email,
      }
      
      await session.save()

      // Redirect to home with success
      return NextResponse.redirect(new URL('/login?login=success', request.url))
    } catch (error) {
      console.error('Database operation failed:', error)
      return new NextResponse('Failed to save session data', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    return new NextResponse('Internal server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}
