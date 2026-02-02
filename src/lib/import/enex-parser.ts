/**
 * ENEX (Evernote Export) XML Parser
 * 
 * Parses .enex files into typed TypeScript objects.
 * ENEX files are XML-based exports from Evernote containing notes,
 * resources (attachments), tags, and metadata.
 */

import { XMLParser } from 'fast-xml-parser';
import type {
    EnexExport,
    EnexNote,
    EnexResource,
    EnexNoteAttributes,
    EnexResourceAttributes,
} from '@/types/enex';

/**
 * XML Parser configuration for ENEX files.
 */
const parserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    cdataPropName: '#cdata',
    preserveOrder: false,
    trimValues: true,
    parseTagValue: true,
    parseAttributeValue: true,
    // Keep arrays for elements that can appear multiple times
    isArray: (name: string) => {
        return ['note', 'tag', 'resource'].includes(name);
    },
};

/**
 * Parse an ENEX XML string into a structured EnexExport object.
 */
export function parseEnexString(xmlContent: string): EnexExport {
    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(xmlContent);

    // Handle the en-export root element
    const enExport = parsed['en-export'];
    if (!enExport) {
        throw new Error('Invalid ENEX file: missing en-export root element');
    }

    // Extract export metadata from attributes
    const exportDate = enExport['@_export-date'];
    const application = enExport['@_application'];
    const version = enExport['@_version'];

    // Parse notes
    const rawNotes = enExport.note || [];
    const notes: EnexNote[] = rawNotes.map(parseNote);

    return {
        exportDate,
        application,
        version,
        notes,
    };
}

/**
 * Parse a raw note object from XML into an EnexNote.
 */
function parseNote(rawNote: Record<string, unknown>): EnexNote {
    // Extract content (may be in CDATA)
    let content = '';
    const rawContent = rawNote.content;
    if (typeof rawContent === 'string') {
        content = rawContent;
    } else if (rawContent && typeof rawContent === 'object') {
        // Handle CDATA wrapper
        const contentObj = rawContent as Record<string, unknown>;
        content = (contentObj['#cdata'] as string) || (contentObj['#text'] as string) || '';
    }

    // Parse tags (can be string or array)
    let tags: string[] = [];
    if (rawNote.tag) {
        if (Array.isArray(rawNote.tag)) {
            tags = rawNote.tag.map((t) => (typeof t === 'string' ? t : String(t)));
        } else {
            tags = [String(rawNote.tag)];
        }
    }

    // Parse resources
    const rawResources = rawNote.resource;
    let resources: EnexResource[] = [];
    if (rawResources) {
        if (Array.isArray(rawResources)) {
            resources = rawResources.map((r) => parseResource(r as Record<string, unknown>));
        } else if (typeof rawResources === 'object' && Object.keys(rawResources as object).length > 0) {
            resources = [parseResource(rawResources as Record<string, unknown>)];
        }
    }

    // Parse note attributes
    const noteAttributes = rawNote['note-attributes']
        ? parseNoteAttributes(rawNote['note-attributes'] as Record<string, unknown>)
        : undefined;

    return {
        title: String(rawNote.title || 'Untitled'),
        content,
        created: rawNote.created ? String(rawNote.created) : undefined,
        updated: rawNote.updated ? String(rawNote.updated) : undefined,
        tags,
        noteAttributes,
        resources: resources.filter((r) => r.data), // Filter out empty resources
    };
}

/**
 * Parse a raw resource object from XML into an EnexResource.
 */
function parseResource(rawResource: Record<string, unknown>): EnexResource {
    // Extract data (may be in nested object with encoding attribute)
    let data = '';
    let encoding = 'base64';

    const rawData = rawResource.data;
    if (typeof rawData === 'string') {
        data = rawData;
    } else if (rawData && typeof rawData === 'object') {
        const dataObj = rawData as Record<string, unknown>;
        data = (dataObj['#text'] as string) || (dataObj['#cdata'] as string) || '';
        if (dataObj['@_encoding']) {
            encoding = String(dataObj['@_encoding']);
        }
    }

    // Parse recognition data (optional, contains OCR results)
    let recognition: string | undefined;
    const rawRecognition = rawResource.recognition;
    if (typeof rawRecognition === 'string') {
        recognition = rawRecognition;
    } else if (rawRecognition && typeof rawRecognition === 'object') {
        const recogObj = rawRecognition as Record<string, unknown>;
        recognition = (recogObj['#cdata'] as string) || (recogObj['#text'] as string);
    }

    // Parse resource attributes
    const resourceAttributes = rawResource['resource-attributes']
        ? parseResourceAttributes(rawResource['resource-attributes'] as Record<string, unknown>)
        : undefined;

    return {
        data: data.replace(/\s/g, ''), // Remove whitespace from base64
        encoding,
        mime: String(rawResource.mime || 'application/octet-stream'),
        width: rawResource.width ? Number(rawResource.width) : undefined,
        height: rawResource.height ? Number(rawResource.height) : undefined,
        duration: rawResource.duration ? Number(rawResource.duration) : undefined,
        resourceAttributes,
        recognition,
    };
}

/**
 * Parse note attributes from XML.
 */
function parseNoteAttributes(
    raw: Record<string, unknown>
): EnexNoteAttributes {
    return {
        sourceUrl: raw['source-url'] ? String(raw['source-url']) : undefined,
        sourceApplication: raw['source-application']
            ? String(raw['source-application'])
            : undefined,
        latitude: raw.latitude ? Number(raw.latitude) : undefined,
        longitude: raw.longitude ? Number(raw.longitude) : undefined,
        altitude: raw.altitude ? Number(raw.altitude) : undefined,
        author: raw.author ? String(raw.author) : undefined,
        source: raw.source ? String(raw.source) : undefined,
        reminderOrder: raw['reminder-order']
            ? Number(raw['reminder-order'])
            : undefined,
        reminderTime: raw['reminder-time']
            ? String(raw['reminder-time'])
            : undefined,
        reminderDoneTime: raw['reminder-done-time']
            ? String(raw['reminder-done-time'])
            : undefined,
        placeName: raw['place-name'] ? String(raw['place-name']) : undefined,
        contentClass: raw['content-class']
            ? String(raw['content-class'])
            : undefined,
        subjectDate: raw['subject-date'] ? String(raw['subject-date']) : undefined,
    };
}

/**
 * Parse resource attributes from XML.
 */
function parseResourceAttributes(
    raw: Record<string, unknown>
): EnexResourceAttributes {
    return {
        sourceUrl: raw['source-url'] ? String(raw['source-url']) : undefined,
        timestamp: raw.timestamp ? String(raw.timestamp) : undefined,
        latitude: raw.latitude ? Number(raw.latitude) : undefined,
        longitude: raw.longitude ? Number(raw.longitude) : undefined,
        altitude: raw.altitude ? Number(raw.altitude) : undefined,
        cameraMake: raw['camera-make'] ? String(raw['camera-make']) : undefined,
        cameraModel: raw['camera-model'] ? String(raw['camera-model']) : undefined,
        attachment: raw.attachment === 'true' || raw.attachment === true,
        fileName: raw['file-name'] ? String(raw['file-name']) : undefined,
    };
}

/**
 * Parse an ENEX file from a Buffer.
 */
export function parseEnexBuffer(buffer: Buffer): EnexExport {
    const xmlContent = buffer.toString('utf-8');
    return parseEnexString(xmlContent);
}

/**
 * Validate that a string is valid ENEX content.
 */
export function isValidEnex(content: string): boolean {
    try {
        // Check for basic ENEX structure
        if (!content.includes('<en-export') || !content.includes('</en-export>')) {
            return false;
        }
        // Try to parse it
        parseEnexString(content);
        return true;
    } catch {
        return false;
    }
}
