import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log('[API HIT] /api/staff/documents - userId:', userId); // ✅ Debug log
    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        const businessLinks = await prisma.businessUser.findMany({
            where: { userId },
            select: { businessId: true },
        });

        const businessIds = businessLinks.map((b) => b.businessId);

        const docs = await prisma.businessDocument.findMany({
            where: { businessId: { in: businessIds } },
            include: { document: true },
        });

        const documents = docs.map((d) => d.document);
        return NextResponse.json(documents);
    } catch (error) {
        console.error('[STAFF_DOCS_ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}
