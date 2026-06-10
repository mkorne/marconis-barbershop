const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  errorFormat: 'pretty',
});

const connectDatabase = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connected successfully');
    return prisma;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  get prisma() {
    if (!prisma) {
      throw new Error('Database not connected. Call connectDatabase() first.');
    }
    return prisma;
  }
};
