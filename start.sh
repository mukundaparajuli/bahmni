#!/bin/sh

echo "🔄 Running Prisma generate..."
npx prisma generate

echo "📦 Running Prisma migrate deploy..."
npx prisma migrate deploy

echo "🚀 Starting the server..."
exec node server.js
