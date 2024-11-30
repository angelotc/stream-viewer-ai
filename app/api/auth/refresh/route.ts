import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

const TWITCH_CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get current session from database
    const session = await prisma.session.findUnique({
      where: { userId }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Exchange refresh token for new access token
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID!,
        client_secret: TWITCH_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken
      }).toString(),
    })

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text())
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 })
    }

    const data = await response.json()

    // Calculate new expiration time
    const expiresAt = new Date(Date.now() + data.expires_in * 1000)

    // Update tokens in database
    await prisma.session.update({
      where: { userId },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt
      }
    })

    return NextResponse.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt
    })
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
  }
}
