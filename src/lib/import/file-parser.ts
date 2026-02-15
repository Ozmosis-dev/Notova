
import { parseEnexBuffer } from './enex-parser';
import type { EnexExport, EnexNote, EnexResource } from '@/types/enex';
import * as mammoth from 'mammoth';
import pdf from 'pdf-parse';

export interface FileParseOptions {
    filename: string;
    mimeType: string;
    buffer: Buffer;
    lastModified?: number;
}

export async function parseFile(options: FileParseOptions): Promise<EnexExport> {
    const { filename, mimeType, buffer } = options;

    // Handle ENEX files
    if (filename.toLowerCase().endsWith('.enex')) {
        return parseEnexBuffer(buffer);
    }

    let content = '';
    let resources: EnexResource[] = [];
    const sourceApp = 'Evernote Clone Import';

    try {
        if (filename.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf') {
            const data = await pdf(buffer);
            // Simple text extraction for PDF. 
            // Newlines to <br> for basic formatting
            const textContent = data.text || '';
            content = `<div>${textContent.replace(/\n/g, '<br/>')}</div>`;
        } else if (filename.toLowerCase().endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.convertToHtml({ buffer });
            content = result.value;
            if (result.messages && result.messages.length > 0) {
                console.log('Mammoth messages:', result.messages);
            }
        } else if (filename.toLowerCase().endsWith('.txt') || mimeType === 'text/plain') {
            const textContent = buffer.toString('utf-8');
            content = `<pre>${textContent}</pre>`;
        } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }
    } catch (error) {
        console.error(`Error parsing file ${filename}:`, error);
        throw new Error(`Failed to parse file ${filename}: ${(error as Error).message}`);
    }

    const title = filename.replace(/\.[^/.]+$/, "");

    // Create a single note from the file content
    const note: EnexNote = {
        title,
        content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>${content}</en-note>`,
        created: options.lastModified ? new Date(options.lastModified).toISOString() : new Date().toISOString(),
        updated: new Date().toISOString(),
        tags: [],
        resources: resources,
        noteAttributes: {
            sourceApplication: sourceApp,
            source: 'import-file'
        }
    };

    return {
        exportDate: new Date().toISOString(),
        application: sourceApp,
        notes: [note]
    };
}
