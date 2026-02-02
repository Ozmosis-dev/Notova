import { vi } from 'vitest';

// Mock Prisma client
export const mockPrismaClient = {
    user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        upsert: vi.fn(),
    },
    notebook: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    note: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    tag: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        upsert: vi.fn(),
    },
    noteTag: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
    },
    attachment: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(mockPrismaClient)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
};

vi.mock('@/lib/db', () => ({
    prisma: mockPrismaClient,
}));

export const resetPrismaMocks = () => {
    Object.values(mockPrismaClient).forEach((model) => {
        if (typeof model === 'object' && model !== null) {
            Object.values(model).forEach((method) => {
                if (typeof method === 'function' && 'mockClear' in method) {
                    (method as ReturnType<typeof vi.fn>).mockClear();
                }
            });
        }
    });
};
