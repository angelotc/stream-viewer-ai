import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || '',
  cookieName: 'stream-viewer-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export async function GET() {
  const session = await getIronSession(cookies(), sessionOptions)
  
  if (!session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        settings: true,
      },
    })

    return NextResponse.json({
      user,
      settings: user?.settings,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getIronSession(cookies(), sessionOptions)
  
  if (!session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { isBotEnabled } = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: { isBotEnabled },
      create: {
        userId: user.id,
        isBotEnabled,
      },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
