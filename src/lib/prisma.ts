import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

// Prisma Postgres (pooled.db.prisma.io) uses standard PostgreSQL protocol.
// The URL format is: postgres://<token>@pooled.db.prisma.io:5432/postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
