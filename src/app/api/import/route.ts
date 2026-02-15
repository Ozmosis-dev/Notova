/**
 * Import API Route
 * 
 * Handles ENEX file uploads and initiates the import process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { importParsedData, listImportJobs } from '@/lib/import';
import { parseFile } from '@/lib/import/file-parser';
import { ensureDbUser } from '@/lib/supabase/server';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        },
    },
};

/**
 * POST /api/import
 * 
 * Upload and import a file (ENEX, PDF, DOCX, TXT).
 * Expects multipart/form-data with:
 * - file: The file to import
 * - notebookName: (optional) Name for the notebook to import into
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user and ensure they exist in database
        const userId = await ensureDbUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        const file = formData.get('file') as File | null;
        const notebookName = formData.get('notebookName') as string | null;

        // Validate file
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const validExtensions = ['.enex', '.pdf', '.docx', '.txt'];
        const lowerName = file.name.toLowerCase();
        if (!validExtensions.some(ext => lowerName.endsWith(ext))) {
            return NextResponse.json(
                { error: 'Invalid file type. Supported formats: .enex, .pdf, .docx, .txt' },
                { status: 400 }
            );
        }

        // Check file size (limit to 100MB)
        const MAX_SIZE = 100 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 100MB.' },
                { status: 413 }
            );
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse the file
        const enexExport = await parseFile({
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            buffer,
            lastModified: file.lastModified
        });

        // Start import process using the parsed data
        const result = await importParsedData(enexExport, {
            userId,
            filename: file.name,
            notebookName: notebookName || undefined,
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Import failed' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/import
 * 
 * List import jobs for the current user.
 */
export async function GET() {
    try {
        const userId = await ensureDbUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const jobs = await listImportJobs(userId, 10);

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error('Error listing import jobs:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to list jobs' },
            { status: 500 }
        );
    }
}
