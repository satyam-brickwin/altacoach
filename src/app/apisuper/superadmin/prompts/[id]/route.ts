// filepath: /src/app/apisuper/superadmin/prompts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // Extract the dynamic id from the URL
        const { system_prompt, language_code } = await req.json(); // Extract the request body

        if (!id || !system_prompt || !language_code) {
            return NextResponse.json({ error: 'Missing id, language code, or prompt' }, { status: 400 });
        }

        // Update the prompt in the database
        const updatedPrompt = await prisma.promptTable.update({
            where: { id },
            data: {
                systemPrompt: system_prompt,
                languageCode: language_code,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(updatedPrompt);
    } catch (err) {
        console.error('Failed to update prompt:', err);
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
    }
}