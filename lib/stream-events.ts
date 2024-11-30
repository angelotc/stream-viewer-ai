import { PrismaClient, MessageType } from '@prisma/client'

const prisma = new PrismaClient()

export type StreamEvent = {
  type: MessageType
  timestamp: Date
  userId: string
  content: string
  metadata?: {
    username?: string     // For chat messages
    confidence?: number   // For transcripts
    duration?: number     // For transcripts
  }
}

export class StreamEventService {
  private static listeners: ((event: StreamEvent) => void)[] = []

  public static async addEvent(event: StreamEvent): Promise<void> {
    // Store in database
    await prisma.message.create({
      data: {
        userId: event.userId,
        content: event.content,
        type: event.type,
        metadata: event.metadata || {},
      }
    })

    // Notify all listeners
    this.listeners.forEach(listener => listener(event))
  }

  public static subscribe(callback: (event: StreamEvent) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  public static async getRecentMessages(userId: string, limit: number = 50): Promise<StreamEvent[]> {
    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return messages.map(msg => ({
      type: msg.type,
      timestamp: msg.createdAt,
      userId: msg.userId,
      content: msg.content,
      metadata: msg.metadata as StreamEvent['metadata']
    }))
  }
}
