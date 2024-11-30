import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { TwitchEventSubService } from '../../../../lib/twitch-eventsub'

const prisma = new PrismaClient()

const sessionOptions = {
  password: process.env.SESSION_PASSWORD!, // Use the same password as auth callback
  cookieName: 'twitch_session', // Use the same cookie name as auth callback
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
    
    if (!session.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ 
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isBotEnabled: user.isBotEnabled
        }
      })
    } catch (error) {
      console.error('Database error in settings GET:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in settings GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = await getIronSession(cookieStore, sessionOptions)
    
    if (!session.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    try {
      const { isBotEnabled } = await request.json()
      console.log('Received request to update bot status:', { isBotEnabled })
      
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        console.log('User not found:', session.user.id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      console.log('Found user:', { id: user.id, isBotEnabled: user.isBotEnabled })

      // Update user settings
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { isBotEnabled },
      })

      console.log('Updated user settings:', { id: updatedUser.id, isBotEnabled: updatedUser.isBotEnabled })

      // Handle EventSub subscription based on bot status
      if (isBotEnabled) {
        console.log('Subscribing to stream events...')
        await TwitchEventSubService.subscribeToStreamEvents(user.id)
      } else {
        console.log('Unsubscribing from stream events...')
        await TwitchEventSubService.unsubscribeFromStreamEvents(user.id)
      }

      return NextResponse.json({ settings: { isBotEnabled: updatedUser.isBotEnabled } })
    } catch (error) {
      console.error('Database error in settings POST:', error)
      return NextResponse.json({ error: 'Database error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in settings POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
