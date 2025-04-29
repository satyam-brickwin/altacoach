// src/app/api/admin/export-chat-questions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { selectedBusinesses, dateRange } = await request.json();

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

        // Build date filter if provided
        let dateFilter = {};
        if (dateRange?.startDate && dateRange?.endDate) {
            dateFilter = {
                created_at: {
                    gte: new Date(dateRange.startDate),
                    lte: new Date(dateRange.endDate)
                }
            };
        }

        // Fetch all chats of these users with questions
        const chats = await prisma.chats.findMany({
            where: { user_id: { in: userIds } },
            select: {
                id: true,
                name: true,
                user_id: true,
                created_at: true,
                chat_history: {
                    where: {
                        question: { not: null },  // Only get entries with questions
                        ...dateFilter
                    },
                    select: {
                        id: true,
                        question: true,
                        answer: true,
                        created_at: true
                    }
                }
            }
        });

        // Filter out chats with no questions
        const chatsWithQuestions = chats.filter(chat => chat.chat_history && chat.chat_history.length > 0);

        return NextResponse.json({
            success: true,
            data: chatsWithQuestions,
            count: chatsWithQuestions.length
        });
    } catch (error) {
        console.error('Error exporting chat questions:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}