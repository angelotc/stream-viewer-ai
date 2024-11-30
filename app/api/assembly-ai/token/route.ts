import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'

export async function GET() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY
    console.log("=== AssemblyAI Token Debug ===")
    console.log("API Key exists:", !!apiKey)
    
    if (!apiKey) {
      console.error('ASSEMBLYAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AssemblyAI API key not configured' }, 
        { status: 500 }
      )
    }

    // Create AssemblyAI client
    const aaiClient = new AssemblyAI({
      apiKey: apiKey
    })

    // Create temporary token
    const token = await aaiClient.realtime.createTemporaryToken({ expires_in: 3600 })
    console.log("Temporary token created:", !!token)

    return NextResponse.json({ token: token })
  } catch (error) {
    console.error('AssemblyAI token error:', error)
    return NextResponse.json(
      { error: 'Failed to create temporary token' }, 
      { status: 500 }
    )
  }
}