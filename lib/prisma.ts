import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client/http'

function createPrismaClient() {
  if (process.env.DATABASE_URL?.startsWith('libsql://')) {
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })
    
    const adapter = new PrismaLibSQL(client)
    return new PrismaClient({ adapter })
  }
  
  return new PrismaClient()
}

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma