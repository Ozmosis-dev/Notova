//
// API endpoint for submitting and retrieving issue reports
//

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// POST - Submit a new issue report
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userEmail, userId, category, description, userAgent } = body;

        // Validate required fields
        if (!userEmail || !category || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: userEmail, category, and description are required' },
                { status: 400 }
            );
        }

        // Validate category
        const validCategories = ['bug', 'feature', 'other'];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { error: 'Invalid category. Must be one of: bug, feature, other' },
                { status: 400 }
            );
        }

        // Create the issue report
        const issueReport = await prisma.issueReport.create({
            data: {
                userEmail,
                userId: userId || null,
                category,
                description,
                userAgent: userAgent || null,
            },
        });

        return NextResponse.json({
            success: true,
            id: issueReport.id,
            message: 'Issue report submitted successfully',
        });
    } catch (error) {
        console.error('Error creating issue report:', error);
        return NextResponse.json(
            { error: 'Failed to submit issue report' },
            { status: 500 }
        );
    }
}

// GET - Retrieve issue reports (for admin purposes)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const since = searchParams.get('since'); // ISO date string

        const where: Record<string, unknown> = {};

        if (status) {
            where.status = status;
        }

        if (since) {
            where.reportedAt = {
                gte: new Date(since),
            };
        }

        const reports = await prisma.issueReport.findMany({
            where,
            orderBy: { reportedAt: 'desc' },
            take: 100, // Limit to last 100 reports
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error fetching issue reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch issue reports' },
            { status: 500 }
        );
    }
}
