import { NextResponse } from 'next/server'
import { TwitchEventSubService } from '../../../../lib/twitch-eventsub'

export async function GET() {
  try {
    await TwitchEventSubService.connect()
    return NextResponse.json({ status: 'WebSocket connection initiated' })
  } catch (error) {
    console.error('WebSocket connection error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate WebSocket connection' },
      { status: 500 }
    )
  }
}

// This endpoint can be used to manually disconnect the WebSocket if needed
export async function DELETE() {
  try {
    await TwitchEventSubService.disconnect()
    return NextResponse.json({ status: 'WebSocket disconnected' })
  } catch (error) {
    console.error('WebSocket disconnection error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect WebSocket' },
      { status: 500 }
    )
  }
}
