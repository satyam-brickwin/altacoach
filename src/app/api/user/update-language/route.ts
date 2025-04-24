import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId, language } = await req.json();

        // Update the user's language in the database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { language },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating user language:', error);
        return NextResponse.json({ success: false, message: 'Failed to update language' }, { status: 500 });
    }
}