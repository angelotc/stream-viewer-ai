const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    // Delete all sessions first (due to foreign key constraints)
    console.log('Deleting all sessions...')
    const deletedSessions = await prisma.session.deleteMany()
    console.log(`Deleted ${deletedSessions.count} sessions`)

    // Delete all chat messages
    console.log('Deleting all chat messages...')
    const deletedMessages = await prisma.chatMessage.deleteMany()
    console.log(`Deleted ${deletedMessages.count} chat messages`)

    // Delete all transcripts
    console.log('Deleting all transcripts...')
    const deletedTranscripts = await prisma.transcript.deleteMany()
    console.log(`Deleted ${deletedTranscripts.count} transcripts`)

    // Delete all users last (since other models reference users)
    console.log('Deleting all users...')
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`Deleted ${deletedUsers.count} users`)

    console.log('Database cleanup completed successfully!')
  } catch (error) {
    console.error('Error cleaning database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanDatabase()
