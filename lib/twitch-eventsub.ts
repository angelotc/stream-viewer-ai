import { PrismaClient, MessageType } from '@prisma/client'
import WebSocket from 'ws'
import { StreamEventService } from './stream-events'

const prisma = new PrismaClient()
const TWITCH_EVENTSUB_WS_URL = 'wss://eventsub.wss.twitch.tv/ws'

export class TwitchEventSubService {
  private static ws: WebSocket | null = null
  private static reconnectAttempts = 0
  private static maxReconnectAttempts = 5
  private static sessionId: string | null = null

  private static async validateToken(token: string): Promise<string> {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${token}`
      }
    });

    if (response.status !== 200) {
      const data = await response.json();
      console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
      console.error(data);
      throw new Error('Invalid token');
    }

    const data = await response.json();
    console.log("Validated token.");
    console.log('Bot user response:', data);
    return data.user_id;
  }

  private static async getAppAccessToken(): Promise<{ token: string, userId: string }> {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        grant_type: 'client_credentials',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get app access token')
    }

    const data = await response.json()
    const userId = await this.validateToken(data.access_token)
    return { token: data.access_token, userId }
  }

  private static async createEventSubSubscription(
    type: 'stream.online' | 'stream.offline' | 'channel.chat.message',
    userId: string,
    token: string,
    botUserId?: string
  ): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No WebSocket session ID available');
    }

    const condition = type === 'channel.chat.message' 
      ? {
          broadcaster_user_id: userId,
          user_id: botUserId // For chat messages, we need both broadcaster and bot user IDs
        }
      : {
          broadcaster_user_id: userId
        };

    const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        version: '1',
        condition,
        transport: {
          method: 'websocket',
          session_id: this.sessionId,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create EventSub subscription: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    console.log(`Successfully created ${type} subscription:`, data)
  }

  private static async removeEventSubSubscription(
    type: 'stream.online' | 'stream.offline' | 'channel.chat.message',
    userId: string
  ): Promise<void> {
    try {
      console.log(`[RemoveEventSub] Starting removal for type: ${type}, userId: ${userId}`)
      
      // Get app access token
      const { token: appAccessToken } = await this.getAppAccessToken()
      console.log('[RemoveEventSub] Got app access token')

      // Fetch existing subscriptions
      console.log('[RemoveEventSub] Fetching existing subscriptions...')
      const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'GET',
        headers: {
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${appAccessToken}`,
        }
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('[RemoveEventSub] Failed to fetch subscriptions:', response.status, errorBody)
        throw new Error(`Failed to fetch subscriptions: ${response.status} ${errorBody}`)
      }

      const data = await response.json()
      console.log('[RemoveEventSub] Current subscriptions:', JSON.stringify(data.data, null, 2))
      
      // Find subscriptions matching the type and user
      const subscriptionsToDelete = data.data.filter(
        (sub: any) => {
          const matches = sub.type === type && sub.condition.broadcaster_user_id === userId
          console.log(`[RemoveEventSub] Checking subscription ${sub.id}: type=${sub.type}, userId=${sub.condition.broadcaster_user_id}, matches=${matches}`)
          return matches
        }
      )

      // If no subscriptions to delete, log and return
      if (subscriptionsToDelete.length === 0) {
        console.log(`[RemoveEventSub] No ${type} subscriptions found for user ${userId}`)
        return
      }

      console.log(`[RemoveEventSub] Found ${subscriptionsToDelete.length} subscriptions to delete`)

      for (const sub of subscriptionsToDelete) {
        console.log(`[RemoveEventSub] Attempting to delete subscription ${sub.id}`)
        const deleteResponse = await fetch(
          `https://api.twitch.tv/helix/eventsub/subscriptions?id=${sub.id}`, 
          {
            method: 'DELETE',
            headers: {
              'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
              'Authorization': `Bearer ${appAccessToken}`,
            }
          }
        )

        switch (deleteResponse.status) {
          case 204:
            console.log(`[RemoveEventSub] Successfully deleted subscription ${sub.id} for type ${type}`)
            break
          case 400:
            const badRequestBody = await deleteResponse.text()
            console.error(`[RemoveEventSub] Bad request when deleting subscription ${sub.id}: ${badRequestBody}`)
            break
          case 401:
            console.error(`[RemoveEventSub] Unauthorized when deleting subscription ${sub.id}`)
            break
          case 404:
            console.log(`[RemoveEventSub] Subscription ${sub.id} not found (already deleted)`)
            break
          default:
            const errorBody = await deleteResponse.text()
            console.error(`[RemoveEventSub] Unexpected status ${deleteResponse.status} when deleting subscription ${sub.id}: ${errorBody}`)
        }
      }
      
      console.log(`[RemoveEventSub] Completed removal process for type: ${type}, userId: ${userId}`)
    } catch (error) {
      console.error('[RemoveEventSub] Error removing EventSub subscription:', error)
      throw error
    }
  }

  public static async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.ws = new WebSocket(TWITCH_EVENTSUB_WS_URL)

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      })

      this.ws.on('open', () => {
        console.log('Connected to Twitch EventSub WebSocket')
        this.reconnectAttempts = 0
      })

      this.ws.on('message', async (data: string) => {
        try {
          const message = JSON.parse(data)
          console.log('Received WebSocket message:', message.metadata.message_type)
          
          if (message.metadata.message_type === 'session_welcome') {
            this.sessionId = message.payload.session.id
            console.log('Received session ID:', this.sessionId)
            resolve()
          } else if (message.metadata.message_type === 'notification') {
            await this.handleNotification(message)
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
          reject(error)
        }
      })
    })
  }

  private static async handleNotification(message: any) {
    const type = message.metadata.subscription_type
    const event = message.payload.event

    switch (type) {
      case 'stream.online':
        console.log('Stream went online:', event)
        await StreamEventService.addEvent({
          type: MessageType.SYSTEM,
          timestamp: new Date(),
          userId: event.broadcaster_user_id,
          content: 'Stream started',
          metadata: {}
        })
        
        // Subscribe to chat messages
        const session = await prisma.session.findUnique({
          where: { userId: event.broadcaster_user_id }
        })
        if (session) {
          await this.createEventSubSubscription(
            'channel.chat.message',
            event.broadcaster_user_id,
            session.accessToken,
            process.env.BOT_USER_ID
          )
        }
        break

      case 'stream.offline':
        console.log('=== Stream Offline Event ===')
        console.log('Raw event data:', JSON.stringify(event, null, 2))
        console.log('Broadcaster ID:', event.broadcaster_user_id)
        
        try {
          console.log('Adding system event for stream end...')
          await StreamEventService.addEvent({
            type: MessageType.SYSTEM,
            timestamp: new Date(),
            userId: event.broadcaster_user_id,
            content: 'Stream ended',
            metadata: {}
          })
          console.log('System event added successfully')

          // Unsubscribe from chat messages
          console.log('Starting chat subscription removal...')
          await this.removeEventSubSubscription('channel.chat.message', event.broadcaster_user_id)
          console.log('Chat subscription removal completed')

          // Close WebSocket connection for this user
          console.log('Closing WebSocket connection...')
          if (this.ws) {
            this.ws.close()
            this.ws = null
            this.sessionId = null
            console.log('WebSocket connection closed')
          }
        } catch (error) {
          console.error('Error handling stream offline event:', error)
        }
        break

      case 'channel.chat.message':
        console.log('Received chat message. Stream status check - User ID:', event.broadcaster_user_id)
        console.log('Chat message:', event.message.text)
        await StreamEventService.addEvent({
          type: MessageType.CHAT,
          timestamp: new Date(),
          userId: event.broadcaster_user_id,
          content: event.message.text,
          metadata: {
            username: event.chatter_user_login
          }
        })
        break
    }
  }

  public static async subscribeToStreamEvents(userId: string): Promise<void> {
    try {
      const session = await prisma.session.findUnique({
        where: { userId }
      })

      if (!session) {
        throw new Error('User session not found')
      }

      // Ensure WebSocket connection is established
      await this.connect()

      // Wait for session ID if needed
      let attempts = 0
      while (!this.sessionId && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
      }

      if (!this.sessionId) {
        throw new Error('Failed to get WebSocket session ID')
      }

      // Subscribe to both online and offline events
      await this.createEventSubSubscription('stream.online', userId, session.accessToken)
      await this.createEventSubSubscription('stream.offline', userId, session.accessToken)
    } catch (error) {
      console.error('Error subscribing to stream events:', error)
      throw error
    }
  }

  public static async unsubscribeFromStreamEvents(userId: string): Promise<void> {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.sessionId = null
    }
    console.log('Unsubscribed from all events for user:', userId)
  }

  public static async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.sessionId = null
    }
  }

  public static async handleStreamOnline(event: any): Promise<void> {
    try {
      const userId = event.broadcaster_user_id
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.isBotEnabled) {
        return
      }

      // Here you can add your bot logic for when a stream goes online
      console.log(`Stream went online for user ${userId}`)
      
      // Example: Send a notification, start a chat bot, etc.
      
    } catch (error) {
      console.error('Error handling stream.online event:', error)
      throw error
    }
  }
}
