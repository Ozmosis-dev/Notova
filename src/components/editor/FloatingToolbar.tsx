'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Editor } from '@tiptap/react';

// Import hooks
import { useKeyboardDetection } from '../../hooks/useKeyboardDetection';
import { useFloatingPosition } from '../../hooks/useFloatingPosition';

// Import existing toolbar components from NoteEditor
// We'll reuse the button components for consistency

interface FloatingToolbarProps {
    editor: Editor | null;
    disabled?: boolean;
    onMoreOptions?: () => void;
    onExport?: () => void;
    moreMenuOpen?: boolean;
    exportMenuOpen?: boolean;
}

// Compact toolbar button - matching NoteEditor style
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
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                p-2.5 rounded-lg transition-all duration-150
                ${isActive ? 'text-[#B8860B] dark:text-[#F7D44C]' : ''}
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

// Divider
function ToolbarDivider() {
    return <div className="w-px h-5 mx-0.5" style={{ background: 'var(--border-primary)' }} />;
}

// Color palette - matching NoteEditor
const COLOR_PALETTE = [
    { color: '#000000', name: 'Black' },
    { color: '#4A4A4A', name: 'Dark Gray' },
    { color: '#9B9B9B', name: 'Gray' },
    { color: '#D9D9D9', name: 'Light Gray' },
    { color: '#B8860B', name: 'Dark Gold' },
    { color: '#F7D44C', name: 'Gold' },
    { color: '#EB7A53', name: 'Coral' },
    { color: '#E85D75', name: 'Rose' },
    { color: '#5B8DEF', name: 'Blue' },
    { color: '#00B4D8', name: 'Cyan' },
    { color: '#2EC4B6', name: 'Teal' },
    { color: '#7C3AED', name: 'Purple' },
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

// Font size picker for floating toolbar
function FontSizePicker({
    editor,
    disabled = false,
    onInteraction,
}: {
    editor: Editor | null;
    disabled?: boolean;
    onInteraction?: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
    const fontSizes = [
        { size: '12px', label: '12' },
        { size: '14px', label: '14' },
        { size: '16px', label: '16' },
        { size: '18px', label: '18' },
        { size: '20px', label: '20' },
        { size: '24px', label: '24' },
        { size: '32px', label: '32' },
    ];

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonPosition({ top: rect.top, left: rect.left, width: rect.width });
        }
    }, [isOpen]);

    // Handle click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                !buttonRef.current?.contains(e.target as Node) &&
                !dropdownRef.current?.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    if (!editor) return null;

    return (
        <div ref={buttonRef} className="relative" onMouseDown={(e) => { e.stopPropagation(); onInteraction?.(); }}>
            <ToolbarButton
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                title="Font Size"
            >
                <div className="flex items-center gap-0.5">
                    <span className="font-semibold text-xs">Aa</span>
                </div>
            </ToolbarButton>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed p-2 rounded-xl shadow-2xl border z-10001"
                    style={{
                        top: `${buttonPosition.top - 8}px`,
                        left: `${buttonPosition.left + buttonPosition.width / 2}px`,
                        transform: 'translate(-50%, -100%)',
                        background: 'var(--surface-content)',
                        borderColor: 'var(--border-primary)',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-1 min-w-[80px]">
                        {fontSizes.map(({ size, label }) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
                                    setIsOpen(false);
                                }}
                                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                                style={{ fontSize: size }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

// Simple color picker for floating toolbar
function ColorPicker({
    editor,
    type,
    disabled = false,
    onInteraction,
}: {
    editor: Editor | null;
    type: 'text' | 'highlight';
    disabled?: boolean;
    onInteraction?: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
    const palette = type === 'text' ? COLOR_PALETTE : HIGHLIGHT_PALETTE;

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonPosition({ top: rect.top, left: rect.left, width: rect.width });
        }
    }, [isOpen]);

    // Handle click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                !buttonRef.current?.contains(e.target as Node) &&
                !dropdownRef.current?.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    if (!editor) return null;

    return (
        <div ref={buttonRef} className="relative" onMouseDown={(e) => { e.stopPropagation(); onInteraction?.(); }}>
            <ToolbarButton
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                title={type === 'text' ? 'Text Color' : 'Highlight'}
            >
                {type === 'text' ? (
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-sm leading-none">A</span>
                        <div className="w-4 h-1 rounded-sm mt-0.5 bg-linear-to-r from-red-500 via-blue-500 to-green-500" />
                    </div>
                ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="8" y="8" width="8" height="8" rx="1" fill="#fef08a" stroke="#eab308" strokeWidth={1.5} />
                    </svg>
                )}
            </ToolbarButton>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed p-3 rounded-xl shadow-2xl border z-10001"
                    style={{
                        top: `${buttonPosition.top - 8}px`,
                        left: `${buttonPosition.left + buttonPosition.width / 2}px`,
                        transform: 'translate(-50%, -100%)',
                        background: 'var(--surface-content)',
                        borderColor: 'var(--border-primary)',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="grid grid-cols-4 gap-1.5">
                        {palette.map(({ color, name }) => (
                            <button
                                key={color || 'none'}
                                type="button"
                                onClick={() => {
                                    if (type === 'text') {
                                        if (color) {
                                            editor.chain().focus().setColor(color).run();
                                        } else {
                                            editor.chain().focus().unsetColor().run();
                                        }
                                    } else {
                                        if (color) {
                                            editor.chain().focus().toggleHighlight({ color }).run();
                                        } else {
                                            editor.chain().focus().unsetHighlight().run();
                                        }
                                    }
                                    setIsOpen(false);
                                }}
                                className="w-7 h-7 rounded-md border-2 border-transparent hover:border-zinc-400 dark:hover:border-zinc-500 hover:scale-110 transition-all shadow-sm"
                                style={{ backgroundColor: color || '#fff' }}
                                title={name}
                            />
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export function FloatingToolbar({
    editor,
    disabled = false,
}: FloatingToolbarProps) {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
    const [toolbarDimensions, setToolbarDimensions] = useState({ width: 400, height: 60 });
    const [uploadingImage, setUploadingImage] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detect keyboard
    const { keyboardHeight, isKeyboardVisible } = useKeyboardDetection();

    // Calculate position
    const position = useFloatingPosition(
        touchPosition,
        toolbarDimensions,
        { width: window.innerWidth, height: window.innerHeight },
        keyboardHeight
    );

    // Measure toolbar dimensions
    useEffect(() => {
        if (toolbarRef.current) {
            const { width, height } = toolbarRef.current.getBoundingClientRect();
            setToolbarDimensions({ width, height });
        }
    }, [visible]);

    // Mount check
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle touch events
    const handleTouchOrClick = useCallback((e: TouchEvent | MouseEvent) => {
        // Check if we're on mobile
        const isMobile = window.innerWidth < 768;
        if (!isMobile) return;

        const target = e.target as HTMLElement;

        // Check if clicking inside the toolbar itself
        if (toolbarRef.current?.contains(target)) {
            // Don't update position or start new timers when clicking toolbar itself
            return;
        }

        // Only track touches in the editor content area
        const isInEditor = target.closest('.ProseMirror') !== null;
        if (!isInEditor) {
            // Hide if clicking outside editor
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
            setVisible(false);
            return;
        }

        // Get touch/click position
        let clientX: number, clientY: number;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0]?.clientX ?? 0;
            clientY = e.touches[0]?.clientY ?? 0;
        } else if ('clientX' in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }

        // Only update position if toolbar is not already visible
        // This prevents position "creep" on repeated touches
        if (!visible) {
            setTouchPosition({ x: clientX, y: clientY });
            setVisible(true);
        }
    }, [visible]);

    // Handle selection change
    const handleSelectionChange = useCallback(() => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile || !editor) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            // No selection - but keep toolbar visible if we have focus
            const editorElement = document.querySelector('.ProseMirror');
            const hasFocus = editorElement && document.activeElement === editorElement;

            if (!hasFocus && visible) {
                setVisible(false);
            }
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0 || rect.height > 0) {
            // Text is selected - update toolbar position to follow selection
            const newX = rect.left + rect.width / 2;
            const newY = rect.top;

            // Only update if position changed significantly (prevents jitter)
            if (!touchPosition ||
                Math.abs(newX - touchPosition.x) > 5 ||
                Math.abs(newY - touchPosition.y) > 5) {
                setTouchPosition({ x: newX, y: newY });
            }

            if (!visible) {
                setVisible(true);
            }
        } else if (visible) {
            // Cursor position (no selection) - get cursor rect  
            if (rect.top > 0) {
                const newX = rect.left;
                const newY = rect.top;

                if (!touchPosition ||
                    Math.abs(newX - touchPosition.x) > 10 ||
                    Math.abs(newY - touchPosition.y) > 10) {
                    setTouchPosition({ x: newX, y: newY });
                }
            }
        }
    }, [editor, visible, touchPosition]);

    // Handle toolbar interaction to prevent premature hiding
    const handleToolbarInteraction = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
        // Prevent event from bubbling up to document handlers
        e?.stopPropagation();
        e?.preventDefault();
    }, []);

    // Handle image upload
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        setUploadingImage(true);

        try {
            // Convert to base64 for now (matching NoteEditor approach)
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                editor.chain().focus().setImage({ src: base64 }).run();
                setUploadingImage(false);
            };
            reader.onerror = () => {
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Image upload failed:', error);
            setUploadingImage(false);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [editor]);

    // Hide toolbar when keyboard closes
    useEffect(() => {
        if (!isKeyboardVisible && visible) {
            // Check if editor still has focus before hiding
            const editorElement = document.querySelector('.ProseMirror');
            const hasFocus = editorElement && document.activeElement === editorElement;

            // Only hide if editor doesn't have focus
            if (!hasFocus) {
                setVisible(false);
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                }
            }
        }
    }, [isKeyboardVisible, visible]);

    // Keep toolbar visible and positioned during active editing
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile || !editor || disabled) return;

        // Handle input event to update cursor position while typing
        const handleInput = () => {
            if (!visible) return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            if (rect.top > 0) {
                const newX = rect.left;
                const newY = rect.top;

                // Update position to follow cursor while typing
                if (Math.abs(newX - (touchPosition?.x || 0)) > 10 ||
                    Math.abs(newY - (touchPosition?.y || 0)) > 10) {
                    setTouchPosition({ x: newX, y: newY });
                }
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('input', handleInput);

        return () => {
            editorElement.removeEventListener('input', handleInput);
        };
    }, [editor, visible, touchPosition, disabled]);

    // Set up event listeners
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile || disabled) return;

        document.addEventListener('touchstart', handleTouchOrClick);
        document.addEventListener('click', handleTouchOrClick);
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            document.removeEventListener('touchstart', handleTouchOrClick);
            document.removeEventListener('click', handleTouchOrClick);
            document.removeEventListener('selectionchange', handleSelectionChange);
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [handleTouchOrClick, handleSelectionChange, disabled]);

    if (!mounted || !editor || disabled) return null;

    return createPortal(
        <AnimatePresence>
            {visible && position && (
                <motion.div
                    ref={toolbarRef}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                    }}
                    className="floating-toolbar fixed z-9999 pointer-events-auto"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}
                >
                    <div
                        className="floating-toolbar-wrapper"
                        style={{
                            overflowY: 'visible',
                            position: 'relative',
                        }}
                        onMouseDown={handleToolbarInteraction}
                        onTouchStart={handleToolbarInteraction}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="floating-toolbar-container flex items-center gap-1 px-2 py-1.5 rounded-xl overflow-x-auto scrollbar-hide max-w-[90vw]"
                            style={{
                                background: 'var(--surface-content)',
                                border: '1px solid var(--border-primary)',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                overflowY: 'visible',
                            }}
                        >
                            {/* Bold */}
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                isActive={editor.isActive('bold')}
                                title="Bold"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                    <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                </svg>
                            </ToolbarButton>

                            {/* Italic */}
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                isActive={editor.isActive('italic')}
                                title="Italic"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 0l-4 16m0 0h4" />
                                </svg>
                            </ToolbarButton>

                            {/* Underline */}
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                isActive={editor.isActive('underline')}
                                title="Underline"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v7a5 5 0 0010 0V4M5 20h14" />
                                </svg>
                            </ToolbarButton>

                            <ToolbarDivider />

                            {/* Font Size */}
                            <FontSizePicker editor={editor} onInteraction={handleToolbarInteraction} />

                            {/* Color pickers */}
                            <ColorPicker editor={editor} type="text" onInteraction={handleToolbarInteraction} />
                            <ColorPicker editor={editor} type="highlight" onInteraction={handleToolbarInteraction} />

                            <ToolbarDivider />

                            {/* Bullet List */}
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                isActive={editor.isActive('bulletList')}
                                title="Bullet List"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </ToolbarButton>

                            {/* Numbered List */}
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                isActive={editor.isActive('orderedList')}
                                title="Numbered List"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h1v4H4V6zm0 6h1v4H4v-4zm0 6h1v4H4v-4zM8 6h12M8 12h12M8 18h12" />
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </ToolbarButton>

                            {/* Insert Image */}
                            <ToolbarButton
                                onClick={() => fileInputRef.current?.click()}
                                title="Insert Image"
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </ToolbarButton>

                            {/* Hidden file input for image upload */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
