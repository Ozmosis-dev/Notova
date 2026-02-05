'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { RichTextEditor, type Editor } from '../editor/RichTextEditor';
import { TagSelector } from './TagSelector';
import { IconButton } from '../ui/EmojiPicker';
import { OpenMoji } from '../ui/OpenMoji';
import { Sparkles, Loader2 } from 'lucide-react';
import { FloatingToolbar } from '../editor/FloatingToolbar';
import '../editor/editor.css';

interface Tag {
    id: string;
    name: string;
}

interface Note {
    id: string;
    title: string;
    icon?: string | null;
    content: string;
    contentPlaintext?: string;
    notebookId?: string;
    tags: Tag[];
    createdAt: Date | string;
    updatedAt: Date | string;
    isTrash?: boolean;
}

// Compact toolbar button for bottom toolbar
function EditorToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                p-2.5 md:p-2 rounded-lg transition-all duration-150
                ${isActive
                    ? 'text-[#B8860B] dark:text-[#F7D44C]'
                    : ''
                }
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
                color: isActive ? undefined : 'var(--text-secondary)',
                background: isActive ? 'var(--highlight-soft)' : undefined,
            }}
            title={title}
        >
            {children}
        </motion.button>
    );
}


// Divider for toolbar sections
function ToolbarDivider() {
    return <div className="w-px h-5 mx-0.5" style={{ background: 'var(--border-primary)' }} />;
}

// Color palette presets - matches warm design palette
const COLOR_PALETTE = [
    // Row 1: Grayscale
    { color: '#000000', name: 'Black' },
    { color: '#4A4A4A', name: 'Dark Gray' },
    { color: '#9B9B9B', name: 'Gray' },
    { color: '#D9D9D9', name: 'Light Gray' },
    // Row 2: Warm tones (matching app palette)
    { color: '#B8860B', name: 'Dark Gold' },
    { color: '#F7D44C', name: 'Gold' },
    { color: '#EB7A53', name: 'Coral' },
    { color: '#E85D75', name: 'Rose' },
    // Row 3: Cool tones
    { color: '#5B8DEF', name: 'Blue' },
    { color: '#00B4D8', name: 'Cyan' },
    { color: '#2EC4B6', name: 'Teal' },
    { color: '#7C3AED', name: 'Purple' },
    // Row 4: Nature
    { color: '#84CC16', name: 'Lime' },
    { color: '#22C55E', name: 'Green' },
    { color: '#F59E0B', name: 'Amber' },
    { color: '#EF4444', name: 'Red' },
];

const HIGHLIGHT_PALETTE = [
    { color: '', name: 'None' },
    { color: '#FEF3C7', name: 'Yellow' },
    { color: '#FED7AA', name: 'Orange' },
    { color: '#FECACA', name: 'Red' },
    { color: '#BBF7D0', name: 'Green' },
    { color: '#BFDBFE', name: 'Blue' },
    { color: '#DDD6FE', name: 'Purple' },
    { color: '#FBCFE8', name: 'Pink' },
];

// Color picker button with dropdown
function ColorPickerButton({
    editor,
    type,
    disabled = false,
}: {
    editor: Editor | null;
    type: 'text' | 'highlight';
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<{ bottom: number; left: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const palette = type === 'text' ? COLOR_PALETTE : HIGHLIGHT_PALETTE;
    const title = type === 'text' ? 'Text Color' : 'Highlight Color';

    const currentColor = type === 'text'
        ? (editor?.getAttributes('textStyle')?.color ?? '#000000')
        : (editor?.getAttributes('highlight')?.color ?? '');

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position above the button using bottom coordinate
            const left = rect.left + rect.width / 2 - 72; // ~half of dropdown width
            const bottom = window.innerHeight - rect.top + 8; // distance from viewport bottom + margin
            setPosition({ bottom, left: Math.max(8, left) });
        }
        setIsOpen(!isOpen);
    };

    const applyColor = (color: string) => {
        if (!editor) return;

        if (type === 'text') {
            if (color) {
                editor.chain().focus().setColor(color).run();
            } else {
                editor.chain().focus().unsetColor().run();
            }
        } else {
            if (color) {
                editor.chain().focus().setHighlight({ color }).run();
            } else {
                editor.chain().focus().unsetHighlight().run();
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <motion.button
                ref={buttonRef}
                type="button"
                onClick={toggleOpen}
                disabled={disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    p-2 rounded-lg transition-all duration-150 flex flex-col items-center gap-0.5
                    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{ color: 'var(--text-secondary)' }}
                title={title}
            >
                {type === 'text' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                        <path strokeLinecap="round" d="M15 12l2 6 2-6" strokeWidth={2.5} fill="none" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                )}
                {/* Color indicator bar */}
                <div
                    className="w-4 h-1 rounded-full"
                    style={{
                        background: currentColor || (type === 'highlight' ? 'var(--border-primary)' : 'currentColor'),
                        border: !currentColor && type === 'highlight' ? '1px dashed var(--border-primary)' : 'none'
                    }}
                />
            </motion.button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && position && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[9998]"
                                onClick={() => setIsOpen(false)}
                            />
                            {/* Color palette dropdown */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="fixed z-[9999] p-2 rounded-xl shadow-xl"
                                style={{
                                    bottom: position.bottom,
                                    left: position.left,
                                    background: 'var(--surface-content)',
                                    border: '1px solid var(--border-primary)',
                                }}
                            >
                                <div className="text-xs font-medium mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                                    {title}
                                </div>
                                <div
                                    className="grid gap-1"
                                    style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
                                >
                                    {palette.map(({ color, name }) => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => applyColor(color)}
                                            title={name}
                                            className={`
                                                w-6 h-6 rounded-md transition-all duration-150
                                                hover:scale-110 hover:shadow-md
                                                ${currentColor === color ? 'ring-2 ring-offset-1 ring-amber-500' : ''}
                                            `}
                                            style={{
                                                background: color || 'transparent',
                                                border: color ? 'none' : '2px dashed var(--border-primary)',
                                            }}
                                        >
                                            {!color && (
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>✕</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

// More options dropdown for advanced formatting
function MoreOptionsMenu({
    editor,
    isOpen,
    onClose,
    buttonRef,
}: {
    editor: Editor | null;
    isOpen: boolean;
    onClose: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<{ bottom: number; right: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position above the button using bottom coordinate
            const right = window.innerWidth - rect.right;
            const bottom = window.innerHeight - rect.top + 8; // distance from viewport bottom + margin
            setPosition({ bottom, right: Math.max(8, right) });
        }
    }, [isOpen, buttonRef]);

    if (!editor) return null;

    const menuItems = [
        { label: 'Heading 1', icon: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
        { label: 'Heading 2', icon: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
        { label: 'Heading 3', icon: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
        { type: 'divider' as const },
        { label: 'Strikethrough', icon: '~S~', action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike') },
        { label: 'Code', icon: '<>', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock') },
        { label: 'Quote', icon: '"', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote') },
        { type: 'divider' as const },
        { label: 'Align Left', icon: '⌘L', action: () => editor.chain().focus().setTextAlign('left').run(), isActive: editor.isActive({ textAlign: 'left' }) },
        { label: 'Align Center', icon: '⌘C', action: () => editor.chain().focus().setTextAlign('center').run(), isActive: editor.isActive({ textAlign: 'center' }) },
        { label: 'Align Right', icon: '⌘R', action: () => editor.chain().focus().setTextAlign('right').run(), isActive: editor.isActive({ textAlign: 'right' }) },
        { type: 'divider' as const },
        { label: 'Horizontal Rule', icon: '—', action: () => editor.chain().focus().setHorizontalRule().run() },
        { label: 'Undo', icon: '↩', action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
        { label: 'Redo', icon: '↪', action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
    ];

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && position && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998]"
                        onClick={onClose}
                    />
                    {/* Menu */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed z-[9999] min-w-[180px] py-2 rounded-xl shadow-xl"
                        style={{
                            bottom: position.bottom,
                            right: position.right,
                            background: 'var(--surface-content)',
                            border: '1px solid var(--border-primary)',
                        }}
                    >
                        {menuItems.map((item, index) => {
                            if ('type' in item && item.type === 'divider') {
                                return (
                                    <div
                                        key={index}
                                        className="h-px my-1 mx-3"
                                        style={{ background: 'var(--border-subtle)' }}
                                    />
                                );
                            }
                            const menuItem = item as { label: string; icon: string; action: () => void; isActive?: boolean; disabled?: boolean };
                            return (
                                <button
                                    key={menuItem.label}
                                    onClick={() => {
                                        menuItem.action();
                                        onClose();
                                    }}
                                    disabled={menuItem.disabled}
                                    className={`
                                        w-full px-3 py-2 text-left flex items-center gap-3 transition-colors
                                        ${menuItem.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--highlight-soft)]'}
                                    `}
                                    style={{
                                        color: menuItem.isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        fontSize: 'var(--font-small)',
                                    }}
                                >
                                    <span
                                        className="w-6 text-center font-mono text-xs"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {menuItem.icon}
                                    </span>
                                    {menuItem.label}
                                    {menuItem.isActive && (
                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

// Export/Share menu for downloading and sharing notes
function ExportShareMenu({
    isOpen,
    onClose,
    buttonRef,
    title,
    content,
}: {
    isOpen: boolean;
    onClose: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    title: string;
    content: string;
}) {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<{ bottom: number; right: number } | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const right = window.innerWidth - rect.right;
            const bottom = window.innerHeight - rect.top + 8;
            setPosition({ bottom, right: Math.max(8, right) });
        }
    }, [isOpen, buttonRef]);

    // Generate clean HTML for export
    const generateHtmlContent = () => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Untitled Note'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 { font-size: 2em; margin-bottom: 1em; }
        h2 { font-size: 1.5em; margin-top: 1.5em; }
        h3 { font-size: 1.25em; margin-top: 1.25em; }
        blockquote {
            border-left: 4px solid #ddd;
            margin-left: 0;
            padding-left: 20px;
            color: #666;
        }
        pre, code {
            background: #f5f5f5;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        pre { padding: 16px; overflow-x: auto; }
        img { max-width: 100%; height: auto; }
        ul, ol { padding-left: 24px; }
    </style>
</head>
<body>
    <h1>${title || 'Untitled Note'}</h1>
    ${content}
</body>
</html>`;
    };

    // Download as HTML
    const downloadAsHtml = () => {
        const htmlContent = generateHtmlContent();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'Untitled Note'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose();
    };

    // Download as PDF (using print dialog)
    const downloadAsPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            // Create a hidden iframe for printing
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '-10000px';
            iframe.style.left = '-10000px';
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.write(generateHtmlContent());
                iframeDoc.close();

                // Wait for content to load
                await new Promise(resolve => setTimeout(resolve, 100));

                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            }

            // Clean up after a delay
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        } finally {
            setIsGeneratingPdf(false);
            onClose();
        }
    };

    // Get plain text content
    const getPlainText = () => {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        return `${title || 'Untitled Note'}\n\n${temp.textContent || temp.innerText || ''}`;
    };

    // Download as plain text
    const downloadAsText = () => {
        const textContent = getPlainText();
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'Untitled Note'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose();
    };

    // Print the note
    const printNote = async () => {
        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
            iframeDoc.write(generateHtmlContent());
            iframeDoc.close();

            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 100));

            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }

        // Clean up after a delay
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
        onClose();
    };

    // Share as PDF
    const shareAsPdf = async () => {
        if (!navigator.share) {
            alert('Sharing is not supported in this browser. Try downloading instead.');
            return;
        }

        setIsGeneratingPdf(true);
        try {
            // For now, share as HTML file (PDF sharing requires server-side generation)
            const htmlContent = generateHtmlContent();
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const file = new File([blob], `${title || 'Untitled Note'}.html`, { type: 'text/html' });

            await navigator.share({
                title: title || 'Untitled Note',
                text: 'Check out this note',
                files: [file],
            });
        } catch (err) {
            // User cancelled or share failed silently
            console.log('Share cancelled or failed:', err);
        } finally {
            setIsGeneratingPdf(false);
            onClose();
        }
    };

    // Share as text
    const shareAsText = async () => {
        const textContent = getPlainText();

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title || 'Untitled Note',
                    text: textContent,
                });
            } catch (err) {
                // User cancelled
                console.log('Share cancelled:', err);
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(textContent);
            alert('Note copied to clipboard!');
        }
        onClose();
    };

    const menuItems = [
        { type: 'header', label: 'Download' },
        {
            label: 'Download as HTML',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            action: downloadAsHtml,
        },
        {
            label: 'Download as PDF',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            action: downloadAsPdf,
        },
        {
            label: 'Download as Text',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            action: downloadAsText,
        },
        { type: 'divider' },
        {
            label: 'Print',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m3-4h6a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                </svg>
            ),
            action: printNote,
        },
        { type: 'divider' },
        { type: 'header', label: 'Share' },
        {
            label: 'Share as File',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            ),
            action: shareAsPdf,
        },
        {
            label: 'Share as Text',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
            ),
            action: shareAsText,
        },
    ];

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && position && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998]"
                        onClick={onClose}
                    />
                    {/* Menu */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed z-[9999] min-w-[200px] py-2 rounded-xl shadow-xl"
                        style={{
                            bottom: position.bottom,
                            right: position.right,
                            background: 'var(--surface-content)',
                            border: '1px solid var(--border-primary)',
                        }}
                    >
                        {menuItems.map((item, index) => {
                            if (item.type === 'divider') {
                                return (
                                    <div
                                        key={index}
                                        className="h-px my-1 mx-3"
                                        style={{ background: 'var(--border-subtle)' }}
                                    />
                                );
                            }
                            if (item.type === 'header') {
                                return (
                                    <div
                                        key={index}
                                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {item.label}
                                    </div>
                                );
                            }
                            const menuItem = item as { label: string; icon: React.ReactNode; action: () => void };
                            return (
                                <button
                                    key={menuItem.label}
                                    onClick={menuItem.action}
                                    disabled={isGeneratingPdf}
                                    className={`
                                        w-full px-3 py-2 text-left flex items-center gap-3 transition-colors
                                        ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--highlight-soft)]'}
                                    `}
                                    style={{
                                        color: 'var(--text-primary)',
                                        fontSize: 'var(--font-small)',
                                    }}
                                >
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {menuItem.icon}
                                    </span>
                                    {menuItem.label}
                                </button>
                            );
                        })}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

interface NoteEditorProps {
    note?: Note | null;
    loading?: boolean;
    saving?: boolean;
    onSave?: (data: { title: string; content: string; icon?: string | null }) => void;
    onDelete?: () => void;
    onRestore?: () => void;
    onTagsChange?: (noteId: string, tags: Tag[]) => void;
    onIconChange?: (noteId: string, icon: string | null) => void;
    onBack?: () => void;
    showBackButton?: boolean;
    onSummarize?: (noteId: string, noteTitle: string) => void;
    isSummarizing?: boolean;
}

export function NoteEditor({
    note,
    loading = false,
    saving = false,
    onSave,
    onDelete,
    onRestore,
    onTagsChange,
    onIconChange,
    onBack,
    showBackButton = false,
    onSummarize,
    isSummarizing = false,
}: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const moreOptionsButtonRef = useRef<HTMLButtonElement>(null);
    const exportButtonRef = useRef<HTMLButtonElement>(null);

    // Sync local state when note changes
    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setIsDirty(false);
        }
    }, [note]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        setIsDirty(true);
    };

    const handleContentChange = (html: string) => {
        setContent(html);
        setIsDirty(true);
    };

    const handleSave = useCallback(() => {
        if (isDirty && onSave) {
            onSave({ title, content });
            setIsDirty(false);
        }
    }, [isDirty, onSave, title, content]);

    // Auto-save on blur or after delay
    useEffect(() => {
        if (!isDirty) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 60000); // Auto-save after 1 minute of inactivity

        return () => clearTimeout(timer);
    }, [isDirty, title, content, handleSave]);

    // Format date - shorter on mobile
    const formatDate = (date: Date | string) => {
        const d = date instanceof Date ? date : new Date(date);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

        if (isMobile) {
            return d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        }

        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center transition-colors"
                style={{ background: 'var(--surface-content)' }}
            >
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 p-2 rounded-xl transition-colors md:hidden"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Back to notes list"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                <Spinner size="lg" />
            </div>
        );
    }

    if (!note) {
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center text-center px-8 relative transition-colors"
                style={{ background: 'var(--surface-content)' }}
            >
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 p-2 rounded-xl transition-colors md:hidden"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Back to notes list"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                        background: 'var(--surface-content-secondary)',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    <svg
                        className="w-12 h-12"
                        style={{ color: 'var(--text-muted)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <h2
                    className="font-bold mb-3"
                    style={{
                        fontSize: 'var(--font-heading)',
                        color: 'var(--text-primary)'
                    }}
                >
                    Select a note to view
                </h2>
                <p
                    className="max-w-sm"
                    style={{
                        fontSize: 'var(--font-body)',
                        color: 'var(--text-secondary)'
                    }}
                >
                    Choose a note from the list or create a new one to get started.
                </p>
            </div>
        );
    }

    return (
        <>
            <div
                className="flex-1 flex flex-col overflow-hidden transition-colors min-w-0 w-full"
                style={{ background: 'var(--surface-content)' }}
            >
                {/* Toolbar - contextual, minimal */}
                <div
                    className="shrink-0 px-5 md:px-8 py-3 flex items-center justify-between"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Back button for mobile */}
                        {showBackButton && (
                            <button
                                onClick={onBack}
                                className="p-2 -ml-2 rounded-xl transition-colors md:hidden"
                                style={{ color: 'var(--text-muted)' }}
                                aria-label="Back to notes list"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        {note.isTrash ? (
                            <>
                                <Button variant="primary" size="sm" onClick={onRestore}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Restore
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Forever
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={!isDirty || saving}
                                >
                                    {saving ? (
                                        <>
                                            <Spinner size="sm" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {isDirty ? 'Save' : 'Saved'}
                                        </>
                                    )}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} title="Move to Trash">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* AI Summarize button - matches notebooks page style */}
                        {onSummarize && !note.isTrash && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSummarize(note.id, title || 'Untitled Note')}
                                disabled={isSummarizing}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0"
                                style={{
                                    background: isSummarizing
                                        ? 'var(--ai-gradient-primary)'
                                        : 'var(--surface-content-secondary)',
                                    color: isSummarizing
                                        ? 'var(--text-on-accent)'
                                        : 'var(--text-primary)',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: '1px solid var(--border-subtle)',
                                    opacity: isSummarizing ? 0.9 : 1
                                }}
                                title="Summarize with AI"
                                aria-label="Summarize with AI"
                            >
                                {isSummarizing ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                                )}
                                <span>AI Summary</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Tags with Date */}
                <div
                    className="shrink-0 px-6 md:px-8 py-2"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <TagSelector
                                noteId={note.id}
                                currentTags={note.tags || []}
                                onTagsChange={(tags) => onTagsChange?.(note.id, tags)}
                                disabled={note.isTrash}
                            />
                        </div>
                        <div
                            className="text-xs shrink-0"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {formatDate(note.updatedAt)}
                        </div>
                    </div>
                </div>

                {/* Trashed notice */}
                {note.isTrash && (
                    <div
                        className="shrink-0 px-6 md:px-8 py-3"
                        style={{
                            background: 'var(--highlight-soft)',
                            borderBottom: '1px solid var(--border-primary)'
                        }}
                    >
                        <p
                            className="text-sm flex items-center gap-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            This note is in the trash. Restore it to continue editing.
                        </p>
                    </div>
                )}

                {/* Editor - generous padding, editorial typography */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 md:px-12 lg:px-16 py-6 md:py-8">
                    {/* Title with Icon - oversized display heading */}
                    <div className="flex items-start gap-3 mb-6">
                        {!note.isTrash && (
                            <IconButton
                                icon={note.icon ?? null}
                                onIconChange={(icon) => onIconChange?.(note.id, icon)}
                                size="lg"
                                placeholder={
                                    <svg
                                        className="w-7 h-7"
                                        style={{ color: 'var(--text-muted)' }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                        )}
                        {note.isTrash && note.icon && (
                            <OpenMoji hexcode={note.icon} size={36} />
                        )}
                        <textarea
                            ref={(textarea) => {
                                if (textarea) {
                                    // Auto-resize textarea to fit content
                                    textarea.style.height = 'auto';
                                    textarea.style.height = `${textarea.scrollHeight}px`;
                                }
                            }}
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Note title"
                            disabled={note.isTrash}
                            rows={1}
                            className="flex-1 font-bold bg-transparent border-none outline-none resize-none disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                                fontSize: 'var(--font-display)',
                                lineHeight: 'var(--leading-tight)',
                                color: 'var(--text-primary)',
                                minWidth: 0,
                                maxWidth: '100%',
                                overflow: 'hidden'
                            }}
                        />
                    </div>



                    {/* Rich Text Editor */}
                    <RichTextEditor
                        content={content}
                        onChange={handleContentChange}
                        placeholder="Start writing..."
                        disabled={note.isTrash}
                        onEditorReady={setEditor}
                    />
                </div>

                {/* Contextual Bottom Toolbar */}
                {!note.isTrash && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="hidden md:flex shrink-0 px-4 md:px-8 py-3 items-center justify-center gap-1 md:gap-2"
                        style={{
                            borderTop: '1px solid var(--border-subtle)',
                            background: 'var(--surface-content-secondary)',
                        }}
                    >
                        {/* Word count indicator */}
                        <div
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg mr-auto"
                            style={{
                                background: 'var(--surface-content)',
                                color: 'var(--text-muted)',
                                fontSize: 'var(--font-small)',
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {(() => {
                                if (!content || typeof content !== 'string') return 0;
                                const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean);
                                return words.length;
                            })()} words
                        </div>

                        {/* Quick formatting actions */}
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl overflow-x-auto hide-scrollbar max-w-full" style={{ background: 'var(--surface-content)' }}>
                            <EditorToolbarButton
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                isActive={editor?.isActive('bold') ?? false}
                                disabled={!editor}
                                title="Bold (Ctrl+B)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                    <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                </svg>
                            </EditorToolbarButton>
                            <EditorToolbarButton
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                isActive={editor?.isActive('italic') ?? false}
                                disabled={!editor}
                                title="Italic (Ctrl+I)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 0l-4 16m0 0h4" />
                                </svg>
                            </EditorToolbarButton>
                            <EditorToolbarButton
                                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                isActive={editor?.isActive('underline') ?? false}
                                disabled={!editor}
                                title="Underline (Ctrl+U)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v7a5 5 0 0010 0V4M5 20h14" />
                                </svg>
                            </EditorToolbarButton>

                            {/* Text and Highlight Color */}
                            <ColorPickerButton editor={editor} type="text" disabled={!editor} />
                            <ColorPickerButton editor={editor} type="highlight" disabled={!editor} />

                            <ToolbarDivider />

                            <EditorToolbarButton
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                isActive={editor?.isActive('bulletList') ?? false}
                                disabled={!editor}
                                title="Bullet List"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </EditorToolbarButton>
                            <EditorToolbarButton
                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                isActive={editor?.isActive('orderedList') ?? false}
                                disabled={!editor}
                                title="Numbered List"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h1v4H4V6zm0 6h1v4H4v-4zm0 6h1v4H4v-4zM8 6h12M8 12h12M8 18h12" />
                                </svg>
                            </EditorToolbarButton>

                            <ToolbarDivider />

                            <EditorToolbarButton
                                onClick={() => {
                                    const url = window.prompt('Enter URL:');
                                    if (url) {
                                        editor?.chain().focus().setLink({ href: url }).run();
                                    }
                                }}
                                isActive={editor?.isActive('link') ?? false}
                                disabled={!editor}
                                title="Add Link"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </EditorToolbarButton>
                            <EditorToolbarButton
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                const base64 = reader.result as string;
                                                editor?.chain().focus().setImage({ src: base64 }).run();
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    };
                                    input.click();
                                }}
                                disabled={!editor}
                                title="Insert Image"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </EditorToolbarButton>

                            <ToolbarDivider />

                            {/* More options button */}
                            <div className="relative">
                                <motion.button
                                    ref={moreOptionsButtonRef}
                                    type="button"
                                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                                    disabled={!editor}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                    p-2 rounded-lg transition-all duration-150
                                    ${!editor ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="More formatting options"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </motion.button>
                                <MoreOptionsMenu
                                    editor={editor}
                                    isOpen={moreMenuOpen}
                                    onClose={() => setMoreMenuOpen(false)}
                                    buttonRef={moreOptionsButtonRef}
                                />
                            </div>

                            <ToolbarDivider />

                            {/* Export/Share button */}
                            <div className="relative">
                                <motion.button
                                    ref={exportButtonRef}
                                    type="button"
                                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 rounded-lg transition-all duration-150 cursor-pointer"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Download or share note"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </motion.button>
                                <ExportShareMenu
                                    isOpen={exportMenuOpen}
                                    onClose={() => setExportMenuOpen(false)}
                                    buttonRef={exportButtonRef}
                                    title={title}
                                    content={content}
                                />
                            </div>

                        </div>

                        {/* Status indicator */}
                        <div
                            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full ml-auto font-medium text-xs ${isDirty
                                ? 'border'
                                : 'bg-[var(--surface-content)] text-[var(--text-muted)]'
                                }`}
                            style={isDirty ? {
                                background: 'transparent',
                                color: 'var(--accent-primary)',
                                borderColor: 'var(--accent-primary)',
                            } : {}}
                        >
                            {saving ? (
                                <>
                                    <Spinner size="sm" />
                                    Saving...
                                </>
                            ) : isDirty ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                                    Unsaved changes
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    All changes saved
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* FloatingToolbar for mobile */}
                {!note.isTrash && <FloatingToolbar editor={editor} />}
            </div>

            {/* Delete Note Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={note?.isTrash ? "Delete Forever" : "Move to Trash"}
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {note?.isTrash ? (
                            <>Are you sure you want to <strong style={{ color: 'var(--text-primary)' }}>permanently delete</strong> this note? This action cannot be undone.</>
                        ) : (
                            <>Are you sure you want to move <strong style={{ color: 'var(--text-primary)' }}>"{note?.title || 'Untitled'}"</strong> to the trash?</>
                        )}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={async () => {
                                setIsDeleting(true);
                                try {
                                    await onDelete?.();
                                    setShowDeleteConfirm(false);
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                            disabled={isDeleting}
                            style={{ background: 'var(--warning-color, #ef4444)' }}
                        >
                            {isDeleting ? 'Deleting...' : (note?.isTrash ? 'Delete Forever' : 'Move to Trash')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
