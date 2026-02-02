/**
 * ENML (Evernote Markup Language) to HTML Converter
 * 
 * Converts Evernote's proprietary ENML format to standard HTML.
 * ENML is similar to XHTML but includes custom elements like:
 * - <en-note>: Root element (becomes <div>)
 * - <en-media>: Embedded resources (becomes <img>, <audio>, <video>, or <a>)
 * - <en-todo>: Checkboxes (becomes styled checkbox)
 * - <en-crypt>: Encrypted content (becomes placeholder)
 */

import type { ResourceHashMap } from '@/types/enex';

/**
 * Options for ENML to HTML conversion.
 */
export interface EnmlConversionOptions {
    /** Map of resource hashes to URLs for en-media replacement */
    resourceMap?: ResourceHashMap;
    /** Whether to sanitize output HTML */
    sanitize?: boolean;
    /** Base URL for relative links */
    baseUrl?: string;
}

/**
 * Convert ENML content to HTML.
 */
export function convertEnmlToHtml(
    enml: string,
    options: EnmlConversionOptions = {}
): string {
    const { resourceMap = new Map(), sanitize = true } = options;

    let html = enml;

    // Remove XML declaration if present
    html = html.replace(/<\?xml[^?]*\?>/gi, '');

    // Remove DOCTYPE if present
    html = html.replace(/<!DOCTYPE[^>]*>/gi, '');

    // Convert <en-note> to <div class="en-note">
    html = html.replace(/<en-note([^>]*)>/gi, '<div class="en-note"$1>');
    html = html.replace(/<\/en-note>/gi, '</div>');

    // Convert <en-media> to appropriate HTML elements
    html = convertEnMedia(html, resourceMap);

    // Convert <en-todo> to checkboxes
    html = convertEnTodo(html);

    // Convert <en-crypt> to placeholder
    html = convertEnCrypt(html);

    // Remove prohibited ENML elements that shouldn't appear in output
    html = removeProhibitedElements(html);

    // Sanitize if requested
    if (sanitize) {
        html = sanitizeHtml(html);
    }

    return html.trim();
}

/**
 * Convert <en-media> elements to appropriate HTML.
 */
function convertEnMedia(html: string, resourceMap: ResourceHashMap): string {
    // Match en-media elements with their attributes
    const enMediaRegex = /<en-media([^>]*)(?:\/>|><\/en-media>)/gi;

    return html.replace(enMediaRegex, (_match, attributes) => {
        // Parse attributes
        const hashMatch = attributes.match(/hash=["']([a-f0-9]+)["']/i);
        const typeMatch = attributes.match(/type=["']([^"']+)["']/i);
        const widthMatch = attributes.match(/width=["'](\d+)["']/i);
        const heightMatch = attributes.match(/height=["'](\d+)["']/i);
        const altMatch = attributes.match(/alt=["']([^"']+)["']/i);

        const hash = hashMatch?.[1] || '';
        const mimeType = typeMatch?.[1] || 'application/octet-stream';
        const width = widthMatch?.[1];
        const height = heightMatch?.[1];
        const alt = altMatch?.[1] || 'Attachment';

        // Look up the resource URL
        const resource = resourceMap.get(hash);
        if (!resource) {
            // Resource not found - create placeholder
            return `<div class="en-media-placeholder" data-hash="${hash}" data-type="${mimeType}">[Attachment: ${alt}]</div>`;
        }

        const { url, filename } = resource;

        // Generate appropriate HTML based on MIME type
        if (mimeType.startsWith('image/')) {
            const sizeAttrs = [
                width ? `width="${width}"` : '',
                height ? `height="${height}"` : '',
            ]
                .filter(Boolean)
                .join(' ');

            return `<img src="${url}" alt="${alt}" ${sizeAttrs} class="en-media en-media-image" loading="lazy" />`;
        }

        if (mimeType.startsWith('audio/')) {
            return `<audio controls class="en-media en-media-audio"><source src="${url}" type="${mimeType}" />Your browser does not support audio.</audio>`;
        }

        if (mimeType.startsWith('video/')) {
            const sizeAttrs = [
                width ? `width="${width}"` : '',
                height ? `height="${height}"` : '',
            ]
                .filter(Boolean)
                .join(' ');

            return `<video controls ${sizeAttrs} class="en-media en-media-video"><source src="${url}" type="${mimeType}" />Your browser does not support video.</video>`;
        }

        // For PDFs, show inline if possible
        if (mimeType === 'application/pdf') {
            return `<a href="${url}" target="_blank" class="en-media en-media-pdf" download="${filename || 'document.pdf'}">📄 ${filename || 'PDF Document'}</a>`;
        }

        // Default: link to download
        return `<a href="${url}" target="_blank" class="en-media en-media-attachment" download="${filename || 'attachment'}">📎 ${filename || 'Attachment'}</a>`;
    });
}

/**
 * Convert <en-todo> elements to HTML checkboxes.
 */
function convertEnTodo(html: string): string {
    // Match en-todo elements
    const enTodoRegex = /<en-todo([^>]*)\/?>(?:<\/en-todo>)?/gi;

    return html.replace(enTodoRegex, (_match, attributes) => {
        const checkedMatch = attributes.match(/checked=["']true["']/i);
        const isChecked = !!checkedMatch;

        return `<input type="checkbox" class="en-todo" ${isChecked ? 'checked disabled' : 'disabled'} />`;
    });
}

/**
 * Convert <en-crypt> elements to placeholders.
 */
function convertEnCrypt(html: string): string {
    // Match en-crypt elements (they contain encrypted content)
    const enCryptRegex = /<en-crypt[^>]*>[\s\S]*?<\/en-crypt>/gi;

    return html.replace(
        enCryptRegex,
        '<div class="en-crypt-placeholder">🔒 [Encrypted content - not imported]</div>'
    );
}

/**
 * Remove elements that are prohibited in ENML output.
 */
function removeProhibitedElements(html: string): string {
    // Remove script, style, and other potentially dangerous elements
    const prohibitedTags = [
        'script',
        'style',
        'iframe',
        'frame',
        'frameset',
        'object',
        'embed',
        'applet',
        'form',
        'input[type="submit"]',
        'input[type="button"]',
        'button',
    ];

    let cleaned = html;
    for (const tag of prohibitedTags) {
        const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
        cleaned = cleaned.replace(regex, '');
        // Also remove self-closing versions
        cleaned = cleaned.replace(new RegExp(`<${tag}[^>]*\\/?>`, 'gi'), '');
    }

    return cleaned;
}

/**
 * Basic HTML sanitization.
 * Removes potentially dangerous attributes.
 */
function sanitizeHtml(html: string): string {
    let sanitized = html;

    // Remove event handlers (onclick, onload, etc.)
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');

    // Remove data: URLs in links (allow in images for small inline data)
    sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"');

    return sanitized;
}

/**
 * Extract plain text from ENML content.
 * Useful for search indexing.
 */
export function extractPlainText(enml: string): string {
    // First convert to HTML
    const html = convertEnmlToHtml(enml, { sanitize: true });

    // Remove all HTML tags
    let text = html.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}
