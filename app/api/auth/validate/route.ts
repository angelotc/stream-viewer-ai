import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('twitch_session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false, error: 'No session found' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    if (!session.userId || !session.accessToken) {
      return NextResponse.json({ authenticated: false, error: 'Invalid session' }, { status: 401 })
    }

    // Validate token with Twitch
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!response.ok) {
      console.error('Twitch validation error:', await response.text())
      
      // Try to refresh the token
      const dbSession = await prisma.session.findUnique({
        where: { userId: session.userId },
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
          body: JSON.stringify({ userId: session.userId })
        })

        if (!refreshResponse.ok) {
          throw new Error('Token refresh failed')
        }

        const { accessToken } = await refreshResponse.json()
        return NextResponse.json({ 
          authenticated: true, 
          user: dbSession.user,
          accessToken
        })
      } catch (error) {
        console.error('Token refresh error:', error)
        return NextResponse.json({ authenticated: false, error: 'Token refresh failed' }, { status: 401 })
      }
    }

    const userData = await response.json()
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: userData.user_id,
        login: userData.login,
        accessToken: session.accessToken
      }
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ authenticated: false, error: 'Validation failed' }, { status: 401 })
  }
}
