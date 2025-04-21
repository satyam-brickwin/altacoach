import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { documentIds, businessId } = await req.json();

        await prisma.businessDocument.deleteMany({
            where: {
                businessId,
                documentId: { in: documentIds },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing business documents:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
