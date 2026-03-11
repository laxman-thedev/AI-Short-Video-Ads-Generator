/**
 * Prisma Client Configuration
 * 
 * Sets up the Prisma ORM client with a PostgreSQL adapter.
 * Handles database connectivity for:
 * - User management and authorization
 * - Project data persistence
 * - Credit tracking and transaction logging
 * 
 * The connection string is retrieved from the DATABASE_URL environment variable.
 */
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

/**
 * Database client instance used for all repository and controller operations.
 */
export { prisma }