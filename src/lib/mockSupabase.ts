export const mockSupabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        gte: (column: string, value: string) => ({
          ilike: (column: string, value: string) => ({
            count: async () => ({ count: 100 }), // Mock count
            range: async (from: number, to: number) => ({
              data: [
                // Mock data
                {
                  id: '1',
                  title: 'Mock Conversation 1',
                  user_id: 'user1',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  messages: [{ count: 10 }],
                },
                {
                  id: '2',
                  title: 'Mock Conversation 2',
                  user_id: 'user2',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  messages: [{ count: 5 }],
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  }),
};