// app/api/chat/history/[chatId]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { chatId: string } }
) {
    const { chatId } = params;

    try {
        const res = await fetch(`${process.env.FASTAPI_BASE_URL}/chat/${chatId}/history`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
            }
        });

        if (!res.ok) throw new Error('Failed to fetch chat history');

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error loading chat history:', error);
        return NextResponse.json({ error: 'Unable to fetch chat history' }, { status: 500 });
    }
}
