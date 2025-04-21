import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { documentIds, businessId, userIds, createUserContentMapping, adminId } = body;

        console.log('📦 Incoming connect-to-business request:', {
            documentIds,
            businessId,
            adminId,
            userIds,
            createUserContentMapping
        });

        if (!Array.isArray(documentIds) || !businessId || !adminId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const connections = [];

        for (const documentId of documentIds) {
            console.log('🔍 Checking document ID:', documentId);

            const documentExists = await prisma.document.findUnique({
                where: { id: documentId }
            });

            if (!documentExists) {
                console.warn(`⚠️ Skipping non-existent document ID: ${documentId}`);
                continue;
            }

            const existing = await prisma.businessDocument.findUnique({
                where: {
                    businessId_documentId: {
                        businessId,
                        documentId
                    }
                }
            });

            if (!existing) {
                const entry = await prisma.businessDocument.create({
                    data: {
                        businessId,
                        documentId,
                        adminId
                    }
                });
                connections.push(entry);
            }
        }

        console.log('✅ Created connections:', connections.length);

        if (createUserContentMapping && Array.isArray(userIds)) {
            console.log('🔗 Skipping UserContent mapping (not implemented)');
        }

        return NextResponse.json({ success: true, connections }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error in connect-to-business:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
