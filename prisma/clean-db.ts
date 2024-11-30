const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    // Delete all messages first
    console.log('Deleting all messages...')
    const deletedMessages = await prisma.message.deleteMany()
    console.log(`Deleted ${deletedMessages.count} messages`)

    // Delete all EventSub subscriptions
    console.log('Deleting all EventSub subscriptions...')
    const deletedSubs = await prisma.eventSubSubscription.deleteMany()
    console.log(`Deleted ${deletedSubs.count} EventSub subscriptions`)

    // Delete all sessions
    console.log('Deleting all sessions...')
    const deletedSessions = await prisma.session.deleteMany()
    console.log(`Deleted ${deletedSessions.count} sessions`)

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
