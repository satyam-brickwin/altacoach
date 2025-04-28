// src/app/api/admin/export-chat-history/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust import if needed

export async function POST(request: Request) {
    try {
        const { selectedBusinesses } = await request.json();

        if (!selectedBusinesses || !Array.isArray(selectedBusinesses)) {
            return NextResponse.json({ success: false, message: 'Invalid businesses list' }, { status: 400 });
        }

        // Find all userIds belonging to these businesses
        const businessUsers = await prisma.businessUser.findMany({
            where: { businessId: { in: selectedBusinesses } },
            select: { userId: true },
        });
        const userIds = businessUsers.map(bu => bu.userId);

        if (userIds.length === 0) {
            return NextResponse.json({ success: false, message: 'No users found for selected businesses' }, { status: 404 });
        }

        // Fetch all chats of these users
        const chats = await prisma.chats.findMany({
            where: { user_id: { in: userIds } },
            include: { chat_history: true },
        });

        return NextResponse.json({ success: true, data: chats });
    } catch (error) {
        console.error('Error exporting chat history:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
