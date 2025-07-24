const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
console.log('Prisma Client initialized');
module.exports = db;