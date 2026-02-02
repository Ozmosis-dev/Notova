/**
 * Import Job Status API Route
 * 
 * Retrieve the status of a specific import job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getImportJobStatus } from '@/lib/import';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/import/[id]
 * 
 * Get the status of an import job.
 */
export async function GET(
    _request: NextRequest,
    { params }: RouteParams
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json(
                { error: 'Job ID required' },
                { status: 400 }
            );
        }

        const job = await getImportJobStatus(id);

        if (!job) {
            return NextResponse.json(
                { error: 'Import job not found' },
                { status: 404 }
            );
        }

        // Calculate progress percentage
        const totalNotes = job.totalNotes ?? 0;
        const progress = totalNotes > 0
            ? Math.round(((job.imported + job.failed) / totalNotes) * 100)
            : 0;

        return NextResponse.json({
            id: job.id,
            status: job.status,
            filename: job.filename,
            totalNotes: job.totalNotes,
            imported: job.imported,
            failed: job.failed,
            progress,
            errors: job.errors,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            createdAt: job.createdAt,
        });
    } catch (error) {
        console.error('Error fetching import job:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch job' },
            { status: 500 }
        );
    }
}
