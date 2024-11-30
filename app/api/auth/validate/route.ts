import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { getIronSession } from 'iron-session'

const sessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: 'twitch_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = await getIronSession(cookieStore, sessionOptions)
    
    if (!session.user?.id || !session.user?.accessToken) {
      return NextResponse.json({ authenticated: false, error: 'No session found' }, { status: 401 })
    }

    // Validate token with Twitch
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`
      }
    })

    if (!response.ok) {
      console.error('Twitch validation error:', await response.text())
      
      // Try to refresh the token
      const dbSession = await prisma.session.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
      })

      if (!dbSession) {
        return NextResponse.json({ authenticated: false, error: 'Session not found' }, { status: 401 })
      }

      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: session.user.id })
        })

        if (!refreshResponse.ok) {
          throw new Error('Token refresh failed')
        }

        return NextResponse.json({ authenticated: true })
      } catch (error) {
        console.error('Token refresh failed:', error)
        return NextResponse.json({ authenticated: false, error: 'Token refresh failed' }, { status: 401 })
      }
    }

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 })
  }
}
