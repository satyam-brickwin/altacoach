# Use the official Node.js Alpine image
FROM node:18

# Install required packages for Prisma and SQLite
#RUN apk add --no-cache openssl bash libc6-compat sqlite

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Ensure fresh Prisma client build with correct binaries
# RUN rm -rf node_modules/.prisma && npm run prisma:generate

# Run migrations (use deploy for non-interactive mode in dev/prod)
# RUN npx prisma migrate deploy
# Build Prisma Client
# RUN npm run prisma:generate

# Expose the port Next.js uses
EXPOSE 3000

# Start the Next.js dev server
CMD ["npm", "run", "dev"]


