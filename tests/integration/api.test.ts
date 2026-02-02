/**
 * Integration Tests for API Routes
 * 
 * These tests verify the API routes work correctly with mocked database
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the dependencies before importing the routes
vi.mock('@/lib/db', () => ({
    prisma: {
        note: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        notebook: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        tag: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn(),
        },
        noteTag: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            deleteMany: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock('@/lib/supabase/server', () => ({
    getAuthUserId: vi.fn(),
    ensureDbUser: vi.fn(),
}));

// Import after mocks
import { prisma } from '@/lib/db';
import { getAuthUserId, ensureDbUser } from '@/lib/supabase/server';

// Helper to create NextRequest
function createRequest(
    url: string,
    options: { method?: string; body?: object } = {}
): NextRequest {
    const { method = 'GET', body } = options;
    const init: { method: string; headers: Record<string, string>; body?: string } = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        init.body = JSON.stringify(body);
    }
    return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

describe('Notes API Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getAuthUserId).mockResolvedValue('test-user-id');
        vi.mocked(ensureDbUser).mockResolvedValue('test-user-id');
    });

    describe('GET /api/notes', () => {
        it('returns 401 when not authenticated', async () => {
            vi.mocked(getAuthUserId).mockResolvedValue(null);

            // Dynamically import to get fresh module
            const { GET } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes');
            const response = await GET(request);

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Authentication required');
        });

        it('returns notes for authenticated user', async () => {
            const mockNotes = [
                {
                    id: 'note-1',
                    title: 'Test Note',
                    contentPlaintext: 'This is a test note content',
                    notebook: { id: 'nb-1', name: 'Default' },
                    tags: [{ tag: { id: 'tag-1', name: 'Work' } }],
                    _count: { attachments: 0 },
                    isTrash: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            vi.mocked(prisma.note.count).mockResolvedValue(1);
            vi.mocked(prisma.note.findMany).mockResolvedValue(mockNotes);

            const { GET } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.notes).toHaveLength(1);
            expect(data.notes[0].title).toBe('Test Note');
        });

        it('filters notes by notebook', async () => {
            vi.mocked(prisma.note.count).mockResolvedValue(0);
            vi.mocked(prisma.note.findMany).mockResolvedValue([]);

            const { GET } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes?notebookId=nb-123');
            await GET(request);

            expect(prisma.note.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        notebookId: 'nb-123',
                    }),
                })
            );
        });

        it('filters notes by tag', async () => {
            vi.mocked(prisma.note.count).mockResolvedValue(0);
            vi.mocked(prisma.note.findMany).mockResolvedValue([]);

            const { GET } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes?tagId=tag-123');
            await GET(request);

            expect(prisma.note.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        tags: { some: { tagId: 'tag-123' } },
                    }),
                })
            );
        });

        it('filters trash notes correctly', async () => {
            vi.mocked(prisma.note.count).mockResolvedValue(0);
            vi.mocked(prisma.note.findMany).mockResolvedValue([]);

            const { GET } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes?isTrash=true');
            await GET(request);

            expect(prisma.note.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        isTrash: true,
                    }),
                })
            );
        });
    });

    describe('POST /api/notes', () => {
        it('returns 401 when not authenticated', async () => {
            vi.mocked(ensureDbUser).mockResolvedValue(null);

            const { POST } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes', {
                method: 'POST',
                body: {
                    title: 'New Note',
                    content: '<p>Content</p>',
                    notebookId: 'nb-1',
                },
            });
            const response = await POST(request);

            expect(response.status).toBe(401);
        });

        it('creates a note successfully', async () => {
            const mockNotebook = { id: 'nb-1', name: 'Default', userId: 'test-user-id' };
            const mockNote = {
                id: 'note-new',
                title: 'New Note',
                content: '<p>Content</p>',
                notebook: mockNotebook,
                tags: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            vi.mocked(prisma.notebook.findFirst).mockResolvedValue(mockNotebook);
            vi.mocked(prisma.note.create).mockResolvedValue(mockNote);

            const { POST } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes', {
                method: 'POST',
                body: {
                    title: 'New Note',
                    content: '<p>Content</p>',
                    notebookId: 'nb-1',
                },
            });
            const response = await POST(request);

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.title).toBe('New Note');
        });

        it('returns 404 for invalid notebook', async () => {
            vi.mocked(prisma.notebook.findFirst).mockResolvedValue(null);

            const { POST } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes', {
                method: 'POST',
                body: {
                    title: 'New Note',
                    content: '<p>Content</p>',
                    notebookId: 'invalid-nb',
                },
            });
            const response = await POST(request);

            expect(response.status).toBe(404);
        });

        it('validates required fields', async () => {
            const { POST } = await import('@/app/api/notes/route');
            const request = createRequest('http://localhost:3000/api/notes', {
                method: 'POST',
                body: {
                    // Missing required fields
                    title: '',
                },
            });
            const response = await POST(request);

            expect(response.status).toBe(400);
        });
    });
});

describe('Tags API Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getAuthUserId).mockResolvedValue('test-user-id');
        vi.mocked(ensureDbUser).mockResolvedValue('test-user-id');
    });

    describe('GET /api/tags', () => {
        it('returns all tags for user', async () => {
            const mockTags = [
                { id: 'tag-1', name: 'Work', createdAt: new Date(), _count: { notes: 5 } },
                { id: 'tag-2', name: 'Personal', createdAt: new Date(), _count: { notes: 3 } },
            ];

            vi.mocked(prisma.tag.findMany).mockResolvedValue(mockTags);

            const { GET } = await import('@/app/api/tags/route');
            const response = await GET();

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.tags).toHaveLength(2);
            expect(data.tags[0].noteCount).toBe(5);
        });

        it('returns 401 when not authenticated', async () => {
            vi.mocked(getAuthUserId).mockResolvedValue(null);

            const { GET } = await import('@/app/api/tags/route');
            const response = await GET();

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/tags', () => {
        it('creates a new tag', async () => {
            const mockTag = { id: 'tag-new', name: 'NewTag', createdAt: new Date() };
            vi.mocked(prisma.tag.findFirst).mockResolvedValue(null);
            vi.mocked(prisma.tag.create).mockResolvedValue(mockTag);

            const { POST } = await import('@/app/api/tags/route');
            const request = createRequest('http://localhost:3000/api/tags', {
                method: 'POST',
                body: { name: 'NewTag' },
            });
            const response = await POST(request);

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.name).toBe('NewTag');
        });

        it('rejects duplicate tag names', async () => {
            vi.mocked(prisma.tag.findFirst).mockResolvedValue(
                { id: 'tag-1', name: 'Existing', createdAt: new Date(), userId: 'test-user-id' }
            );

            const { POST } = await import('@/app/api/tags/route');
            const request = createRequest('http://localhost:3000/api/tags', {
                method: 'POST',
                body: { name: 'Existing' },
            });
            const response = await POST(request);

            expect(response.status).toBe(409);
        });
    });
});
