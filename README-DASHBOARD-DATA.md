# Connecting Admin Dashboard to Real Database Data

This document explains how to connect the Admin Dashboard to your database to display real-time statistics.

## Current Implementation

I've updated the Admin Dashboard to fetch data from an API endpoint (`/api/admin/dashboard-stats`) instead of using static data. The updates include:

1. Modified `src/app/admin/page.tsx` to fetch data from the API
2. Created a placeholder API endpoint at `src/app/api/admin/dashboard-stats/route.ts`

## How to Complete the Implementation

Follow these steps to connect your dashboard to real data:

### 1. Set Up Prisma (if not already done)

```bash
npm install @prisma/client prisma
npx prisma init
```

### 2. Update Your Prisma Schema

Make sure your schema includes the necessary models for businesses, users, etc.:

```prisma
// prisma/schema.prisma
model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  role         Role      @default(USER)
  // Add other fields
}

model Business {
  id           String    @id @default(cuid())
  name         String
  // Add other fields
}

// Add other models as needed
```

### 3. Update the API Endpoint

Edit `src/app/api/admin/dashboard-stats/route.ts` to use your actual models:

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get business statistics
    const totalBusinesses = await prisma.business.count();
    const activeBusinesses = await prisma.business.count({
      where: { 
        // Define your "active" criteria, e.g.:
        // lastActive: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });
    
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const adminUsers = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    const businessUsers = await prisma.user.count({
      where: { role: 'BUSINESS' }
    });
    
    // Add queries for other metrics

    return NextResponse.json({
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
        // Add other business metrics
      },
      users: {
        total: totalUsers,
        admins: adminUsers,
        business: businessUsers,
        // Add other user metrics
      },
      // Add other categories as needed
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

### 4. Add Authentication to the API Endpoint

Ensure only admin users can access this endpoint:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export async function GET() {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Rest of the function...
}
```

### 5. Add Loading States to the Dashboard

The dashboard already includes loading states, but you may want to enhance them:

```tsx
{isLoading ? (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded"></div>
) : (
  <div className="stat-value text-4xl">{businessStats.totalBusinesses}</div>
)}
```

## Additional Considerations

1. **Caching**: Consider caching the dashboard stats to reduce database load
2. **Refresh**: Add a refresh button to let admins manually update the stats
3. **Real-time updates**: For a more dynamic dashboard, consider implementing WebSockets
4. **Error handling**: Enhance error handling to show appropriate error messages

By following these steps, your Admin Dashboard will display real-time data from your database instead of static numbers. 