'use client';

import { useState, useRef, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface ImportResult {
    success: boolean;
    notesImported: number;
    attachmentsImported: number;
    notebookName: string;
    errors: string[];
}

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: (result: ImportResult) => void;
}

type ImportStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<ImportStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.name.endsWith('.enex')) {
                setError('Please select a valid .enex file');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (!droppedFile.name.endsWith('.enex')) {
                setError('Please select a valid .enex file');
                return;
            }
            setFile(droppedFile);
            setError(null);
            setResult(null);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleImport = async () => {
        if (!file) return;

        setStatus('uploading');
        setProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            // TODO: Get actual userId from auth context
            formData.append('userId', 'user-1');
            // Use the filename (without .enex) as the notebook name
            const notebookName = file.name.replace(/\.enex$/i, '');
            formData.append('notebookName', notebookName);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            setStatus('processing');

            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Import failed');
            }

            const importResult = await response.json();
            const notebookNameUsed = file.name.replace(/\.enex$/i, '');
            setResult({
                success: true,
                notesImported: importResult.imported || importResult.notesImported || 0,
                attachmentsImported: importResult.attachmentsImported || 0,
                notebookName: notebookNameUsed,
                errors: importResult.errors || [],
            });
            setStatus('complete');
            onImportComplete?.(importResult);
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Import failed');
        }
    };

    const handleClose = () => {
        if (status === 'uploading' || status === 'processing') {
            return; // Don't allow closing during import
        }
        setFile(null);
        setStatus('idle');
        setProgress(0);
        setResult(null);
        setError(null);
        onClose();
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Import from Evernote"
            size="md"
        >
            <div className="space-y-6">
                {/* File Drop Zone */}
                {status === 'idle' && !file && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={handleBrowseClick}
                        className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer"
                    >
                        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Drop your .enex file here
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            or click to browse
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".enex"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Selected File */}
                {file && status === 'idle' && (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Progress */}
                {(status === 'uploading' || status === 'processing') && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Spinner />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                {status === 'uploading' ? 'Uploading...' : 'Processing notes...'}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Success */}
                {status === 'complete' && result && (
                    <div className="text-center py-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                            Import Complete!
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Successfully imported {result.notesImported} note{result.notesImported !== 1 ? 's' : ''}
                            {result.attachmentsImported > 0 && ` and ${result.attachmentsImported} attachment${result.attachmentsImported !== 1 ? 's' : ''}`}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                            into notebook <span className="font-medium text-emerald-600 dark:text-emerald-400">"{result.notebookName}"</span>
                        </p>
                        {result.errors.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-left">
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                                    {result.errors.length} warning(s):
                                </p>
                                <ul className="text-xs text-amber-600 dark:text-amber-300 list-disc list-inside">
                                    {result.errors.slice(0, 3).map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                    {result.errors.length > 3 && (
                                        <li>...and {result.errors.length - 3} more</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                        <svg className="mx-auto w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    {status === 'idle' && (
                        <>
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleImport}
                                disabled={!file}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Import Notes
                            </Button>
                        </>
                    )}
                    {status === 'complete' && (
                        <Button variant="primary" onClick={handleClose}>
                            Done
                        </Button>
                    )}
                    {status === 'error' && (
                        <>
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={() => setStatus('idle')}>
                                Try Again
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
