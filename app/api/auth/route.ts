import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || '',
  cookieName: 'stream-viewer-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export async function POST(request: Request) {
  const session = await getIronSession(cookies(), sessionOptions)
  const { email, password } = await request.json()

  try {
    // Add your authentication logic here
    // For example, verify against your database
    if (email && password) {
      session.user = { email }
      await session.save()
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getIronSession(cookies(), sessionOptions)
  
  if (session.user) {
    return NextResponse.json({ authenticated: true, user: session.user })
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 })
}
