import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
    auth: {
        getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null,
        }),
        getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
            error: null,
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' }, session: {} },
            error: null,
        }),
        signUp: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' }, session: {} },
            error: null,
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        }),
    },
    from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
};

// Mock the createClient function
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => mockSupabaseClient),
}));

export const resetSupabaseMocks = () => {
    Object.values(mockSupabaseClient.auth).forEach((mock) => {
        if (typeof mock === 'function' && 'mockClear' in mock) {
            mock.mockClear();
        }
    });
};
