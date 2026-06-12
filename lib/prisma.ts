import { PrismaClient } from '@prisma/client'

// Factory for Prisma client with Turso/libsql support
function createPrismaClient(): PrismaClient {
  const isTurso = process.env.DATABASE_URL?.startsWith('libsql://')
  
  if (isTurso) {
    // Dynamic import for Turso dependencies (only needed in edge/serverless)
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const { createClient } = require('@libsql/client/http')
    
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    
    const adapter = new PrismaLibSQL(client)
    return new PrismaClient({ adapter })
  }
  
  return new PrismaClient()
}

// Singleton pattern for Prisma client
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma