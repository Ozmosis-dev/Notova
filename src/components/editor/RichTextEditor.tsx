'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Dropcursor from '@tiptap/extension-dropcursor';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    onEditorReady?: (editor: Editor) => void;
    showToolbar?: boolean;
}

// Toolbar Button Component
function ToolbarButton({
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
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`
                p-1.5 rounded-md transition-all duration-150
                ${isActive
                    ? 'bg-[#F6ECC9] text-[#B8860B] dark:bg-[#F7D44C]/20 dark:text-[#F7D44C]'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            {children}
        </button>
    );
}

// Toolbar Divider
function ToolbarDivider() {
    return <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />;
}

// Interactive Table Size Selector Grid
function TableSizeSelector({
    onSelect,
    maxRows = 8,
    maxCols = 8
}: {
    onSelect: (rows: number, cols: number) => void;
    maxRows?: number;
    maxCols?: number;
}) {
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

    return (
        <div className="p-3">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                Insert Table {hoveredCell ? `(${hoveredCell.row} × ${hoveredCell.col})` : ''}
            </div>
            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}
                onMouseLeave={() => setHoveredCell(null)}
            >
                {Array.from({ length: maxRows * maxCols }).map((_, index) => {
                    const row = Math.floor(index / maxCols) + 1;
                    const col = (index % maxCols) + 1;
                    const isHighlighted = hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col;

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`
                                w-5 h-5 rounded border-2 transition-all duration-75
                                ${isHighlighted
                                    ? 'bg-[#F7D44C] border-[#B8860B] dark:bg-[#F7D44C] dark:border-[#EB7A53]'
                                    : 'bg-zinc-100 border-zinc-300 dark:bg-zinc-700 dark:border-zinc-600 hover:border-zinc-400'}
                            `}
                            onMouseEnter={() => setHoveredCell({ row, col })}
                            onClick={() => onSelect(row, col)}
                        />
                    );
                })}
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 text-center">
                Click to insert table
            </div>
        </div>
    );
}

// Color Picker Dropdown
function ColorPicker({
    editor,
    type,
}: {
    editor: Editor;
    type: 'text' | 'highlight';
}) {
    const colors = [
        { color: '#000000', name: 'Black' },
        { color: '#374151', name: 'Gray' },
        { color: '#ef4444', name: 'Red' },
        { color: '#f97316', name: 'Orange' },
        { color: '#eab308', name: 'Yellow' },
        { color: '#22c55e', name: 'Green' },
        { color: '#14b8a6', name: 'Teal' },
        { color: '#3b82f6', name: 'Blue' },
        { color: '#8b5cf6', name: 'Purple' },
        { color: '#ec4899', name: 'Pink' },
    ];

    const highlightColors = [
        { color: '#fef08a', name: 'Yellow' },
        { color: '#bbf7d0', name: 'Green' },
        { color: '#bfdbfe', name: 'Blue' },
        { color: '#fbcfe8', name: 'Pink' },
        { color: '#fed7aa', name: 'Orange' },
        { color: '#e9d5ff', name: 'Purple' },
    ];

    const activeColors = type === 'text' ? colors : highlightColors;

    return (
        <div className="relative group">
            <ToolbarButton
                onClick={() => { }}
                title={type === 'text' ? 'Text Color' : 'Highlight Color'}
            >
                {type === 'text' ? (
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-sm leading-none">A</span>
                        <div className="w-4 h-1 rounded-sm mt-0.5 bg-gradient-to-r from-red-500 via-blue-500 to-green-500" />
                    </div>
                ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2L4 7l1.5 1.5M4 7l5 5M15 22l5-5-1.5-1.5M20 17l-5-5" />
                        <rect x="8" y="8" width="8" height="8" rx="1" fill="#fef08a" stroke="#eab308" strokeWidth={1.5} />
                    </svg>
                )}
            </ToolbarButton>
            <div className="absolute top-full right-0 mt-1 p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[180px]">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                    {type === 'text' ? 'Text Color' : 'Highlight Color'}
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {activeColors.map(({ color, name }) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => {
                                if (type === 'text') {
                                    editor.chain().focus().setColor(color).run();
                                } else {
                                    editor.chain().focus().toggleHighlight({ color }).run();
                                }
                            }}
                            className="w-7 h-7 rounded-md border-2 border-transparent hover:border-zinc-400 dark:hover:border-zinc-500 hover:scale-110 transition-all shadow-sm"
                            style={{ backgroundColor: color }}
                            title={name}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (type === 'text') {
                            editor.chain().focus().unsetColor().run();
                        } else {
                            editor.chain().focus().unsetHighlight().run();
                        }
                    }}
                    className="w-full px-2 py-1.5 text-xs text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
                >
                    <span className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-zinc-400">✕</span>
                    Remove {type === 'text' ? 'color' : 'highlight'}
                </button>
            </div>
        </div>
    );
}

// Main Toolbar Component
function Toolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 overflow-visible">
            {/* Text Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0l-4 16m0 0h4" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline (Ctrl+U)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v7a5 5 0 0010 0V4M5 20h14" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4M4 12h16" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <span className="text-sm font-bold">H1</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <span className="text-sm font-bold">H2</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <span className="text-sm font-bold">H3</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setParagraph().run()}
                isActive={editor.isActive('paragraph')}
                title="Paragraph"
            >
                <span className="text-sm">¶</span>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M8 6h12M4 12h.01M8 12h12M4 18h.01M8 18h12" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h1v4H4V6zm0 6h1v4H4v-4zm0 6h1v4H4v-4zM8 6h12M8 12h12M8 18h12" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Alignment */}
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Special Blocks */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Blockquote"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Link */}
            <ToolbarButton
                onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                isActive={editor.isActive('link')}
                title="Add Link"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            </ToolbarButton>
            {editor.isActive('link') && (
                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    title="Remove Link"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </ToolbarButton>
            )}

            <ToolbarDivider />

            {/* Image */}
            <ToolbarButton
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
                                editor.chain().focus().setImage({ src: base64 }).run();
                            };
                            reader.readAsDataURL(file);
                        }
                    };
                    input.click();
                }}
                title="Insert Image"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Table Controls */}
            <div className="relative group">
                <ToolbarButton
                    onClick={() => { }}
                    isActive={editor.isActive('table')}
                    title="Table Options"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
                    </svg>
                </ToolbarButton>
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[220px]">
                    {/* Table Size Selector Grid */}
                    <TableSizeSelector
                        onSelect={(rows, cols) => {
                            editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                        }}
                        maxRows={6}
                        maxCols={6}
                    />
                    {editor.isActive('table') && (
                        <>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-600 my-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().addColumnBefore().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            >
                                Add Column Before
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            >
                                Add Column After
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().deleteColumn().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400"
                            >
                                Delete Column
                            </button>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-600 my-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().addRowBefore().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            >
                                Add Row Before
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().addRowAfter().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            >
                                Add Row After
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().deleteRow().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400"
                            >
                                Delete Row
                            </button>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-600 my-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().mergeCells().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            >
                                Merge Cells
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().splitCell().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            >
                                Split Cell
                            </button>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-600 my-1" />
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                className="px-3 py-1.5 text-sm text-left rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400"
                            >
                                Delete Table
                            </button>
                        </>
                    )}
                </div>
            </div>

            <ToolbarDivider />

            {/* Colors */}
            <ColorPicker editor={editor} type="text" />
            <ColorPicker editor={editor} type="highlight" />

            <ToolbarDivider />

            {/* Undo/Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Shift+Z)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
            </ToolbarButton>
        </div>
    );
}

// Main Editor Component
export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Start writing...',
    disabled = false,
    onEditorReady,
    showToolbar = false,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#EB7A53] dark:text-[#EB7A53] underline hover:text-[#B8860B] dark:hover:text-[#F7D44C]',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
            Dropcursor.configure({
                color: '#F7D44C',
                width: 2,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'table-auto border-collapse w-full',
                },
            }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content,
        editable: !disabled,
        immediatelyRender: false, // Fix SSR hydration mismatch in Next.js
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                // Seamless editor - no visible container, blends with warm background
                class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[200px]',
            },
        },
    });

    // Notify parent when editor is ready
    useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    // Update content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    // Update editable state
    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    return (
        <div className="seamless-editor">
            {/* Show inline toolbar only if explicitly requested */}
            {showToolbar && !disabled && <Toolbar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
}

// Export Editor type for use in parent components
export type { Editor };

export default RichTextEditor;

