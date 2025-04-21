import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { name, user_id, question, file_ids } = body;

        if (!name || !user_id || !question) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const fastapiUrl = `${process.env.FASTAPI_BASE_URL || 'http://localhost:8000'}/chat/create`;

        const response = await fetch(fastapiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                user_id,
                question,
                file_ids
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[CHAT_CREATE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
