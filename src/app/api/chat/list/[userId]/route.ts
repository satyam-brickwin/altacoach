// app/api/chat/list/[userId]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    const userId = params.userId;

    try {
        const res = await fetch(`${process.env.FASTAPI_BASE_URL}/chat/user/${userId}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch chat history');
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Error fetching chat history:', error);
        return NextResponse.json({ error: 'Unable to fetch chat history' }, { status: 500 });
    }
}
