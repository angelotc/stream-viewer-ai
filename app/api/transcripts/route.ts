import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const text = formData.get('text') as string
    const audioBlob = formData.get('audio') as Blob

    // Save the transcript to the database
    const transcript = await prisma.transcript.create({
      data: {
        text,
        // Add user association if needed
        // userId: session.user.id,
      },
    })

    // Here you could also save the audio blob to your storage solution
    // For example, upload to S3 or similar

    return NextResponse.json(transcript)
  } catch (error) {
    console.error('Failed to save transcript:', error)
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const transcripts = await prisma.transcript.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // Add user filter if needed
      // where: {
      //   userId: session.user.id,
      // },
    })

    return NextResponse.json(transcripts)
  } catch (error) {
    console.error('Failed to fetch transcripts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    )
  }
}
