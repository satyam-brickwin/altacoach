import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
    try {
        const chatId = params.chatId;
        const body = await req.json();

        const { question, file_ids } = body;

        if (!question || !chatId) {
            return NextResponse.json({ error: 'Missing chat ID or question' }, { status: 400 });
        }

        const fastapiUrl = `${process.env.FASTAPI_BASE_URL || 'http://localhost:8000'}/chat/${chatId}/ask`;

        const response = await fetch(fastapiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, file_ids }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[CHAT_CONTINUE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
