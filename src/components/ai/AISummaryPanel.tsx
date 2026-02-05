'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Sparkles,
    Lightbulb,
    Tag,
    Link2,
    CheckCircle2,
    Copy,
    BookmarkPlus,
    AlertCircle
} from 'lucide-react';
import '@/styles/ai.css';

export type SummaryType = 'note' | 'notebook' | 'search';

export interface NoteSummaryData {
    summary: string;
    keyPoints: string[];
    cached?: boolean;
}

export interface NotebookSummaryData {
    summary: string;
    themes: string[];
    keyFindings: string[];
    noteCount: number;
    cached?: boolean;
}

export interface SearchInsightsData {
    summary: string;
    themes: string[];
    connections: string[];
    keyFindings: string[];
    query: string;
    noteCount: number;
    cached?: boolean;
}

interface AISummaryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    type: SummaryType;
    title: string;
    isLoading?: boolean;
    error?: string | null;
    data?: NoteSummaryData | NotebookSummaryData | SearchInsightsData | null;
    onSaveAsNote?: () => void;
    onRetry?: () => void;
}

export function AISummaryPanel({
    isOpen,
    onClose,
    type,
    title,
    isLoading = false,
    error = null,
    data = null,
    onSaveAsNote,
    onRetry,
}: AISummaryPanelProps) {
    const copyToClipboard = () => {
        if (!data) return;

        let content = `# Summarize: ${title}\n\n`;
        content += `${data.summary}\n\n`;

        if ('keyPoints' in data && data.keyPoints) {
            content += '## Key Points\n';
            data.keyPoints.forEach(point => {
                content += `• ${point}\n`;
            });
        }

        if ('themes' in data && data.themes) {
            content += '\n## Themes\n';
            data.themes.forEach(theme => {
                content += `• ${theme}\n`;
            });
        }

        if ('connections' in data && data.connections) {
            content += '\n## Connections\n';
            data.connections.forEach(conn => {
                content += `• ${conn}\n`;
            });
        }

        if ('keyFindings' in data && data.keyFindings) {
            content += '\n## Key Findings\n';
            data.keyFindings.forEach(finding => {
                content += `• ${finding}\n`;
            });
        }

        navigator.clipboard.writeText(content);
    };

    const getPanelTitle = () => {
        switch (type) {
            case 'note':
                return 'Note Summary';
            case 'notebook':
                return 'Notebook Summary';
            case 'search':
                return 'Search Insights';
            default:
                return 'Summarize';
        }
    };

    return (
        <>
            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="ai-panel-overlay visible"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Panel */}
            <div className={`ai-summary-panel ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="ai-panel-header">
                    <div className="ai-panel-title">
                        <Sparkles size={20} />
                        <span>{getPanelTitle()}</span>
                    </div>
                    <button className="ai-panel-close" onClick={onClose} aria-label="Close panel">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="ai-panel-content">
                    {isLoading ? (
                        <div className="ai-loading">
                            <div className="ai-loading-spinner" />
                            <span className="ai-loading-text">Analyzing content...</span>
                        </div>
                    ) : error ? (
                        <div className="ai-error">
                            <AlertCircle className="ai-error-icon" />
                            <p className="ai-error-text">{error}</p>
                            {onRetry && (
                                <button className="ai-retry-button" onClick={onRetry}>
                                    Try Again
                                </button>
                            )}
                        </div>
                    ) : data ? (
                        <>
                            {/* Title Context */}
                            <div className="ai-summary-section">
                                <h3 className="ai-summary-section-title">Summarizing</h3>
                                <p className="ai-summary-text" style={{ fontWeight: 500 }}>{title}</p>
                            </div>

                            {/* Main Summary */}
                            <div className="ai-summary-section">
                                <h3 className="ai-summary-section-title">Summary</h3>
                                <p className="ai-summary-text">{data.summary}</p>
                            </div>

                            {/* Key Points (for notes) */}
                            {'keyPoints' in data && data.keyPoints && data.keyPoints.length > 0 && (
                                <div className="ai-summary-section">
                                    <h3 className="ai-summary-section-title">Key Points</h3>
                                    <ul className="ai-key-points">
                                        {data.keyPoints.map((point, index) => (
                                            <li key={index} className="ai-key-point">
                                                <span className="ai-key-point-icon">
                                                    <Lightbulb size={16} />
                                                </span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Themes */}
                            {'themes' in data && data.themes && data.themes.length > 0 && (
                                <div className="ai-summary-section">
                                    <h3 className="ai-summary-section-title">Themes</h3>
                                    <div className="ai-themes">
                                        {data.themes.map((theme, index) => (
                                            <span key={index} className="ai-theme-tag">
                                                <Tag size={12} />
                                                {theme}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Connections (for search insights) */}
                            {'connections' in data && data.connections && data.connections.length > 0 && (
                                <div className="ai-summary-section">
                                    <h3 className="ai-summary-section-title">Connections</h3>
                                    <div className="ai-connections">
                                        {data.connections.map((connection, index) => (
                                            <div key={index} className="ai-connection">
                                                <Link2 className="ai-connection-icon" size={16} />
                                                <span>{connection}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Key Findings */}
                            {'keyFindings' in data && data.keyFindings && data.keyFindings.length > 0 && (
                                <div className="ai-summary-section">
                                    <h3 className="ai-summary-section-title">Key Findings</h3>
                                    <ul className="ai-key-points">
                                        {data.keyFindings.map((finding, index) => (
                                            <li key={index} className="ai-key-point">
                                                <span className="ai-key-point-icon">
                                                    <CheckCircle2 size={16} />
                                                </span>
                                                <span>{finding}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="ai-meta">
                                {'noteCount' in data && (
                                    <span className="ai-meta-item">
                                        {data.noteCount} notes analyzed
                                    </span>
                                )}
                                {data.cached && (
                                    <span className="ai-cached-badge">Cached</span>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Actions */}
                {data && !isLoading && !error && (
                    <div className="ai-panel-actions">
                        <button className="ai-action-button secondary" onClick={copyToClipboard}>
                            <Copy size={16} />
                            Copy
                        </button>
                        {onSaveAsNote && (
                            <button className="ai-action-button" onClick={onSaveAsNote}>
                                <BookmarkPlus size={16} />
                                Save as Note
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default AISummaryPanel;
