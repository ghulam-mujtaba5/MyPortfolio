import "@testing-library/jest-dom";
// Basic fetch mock for components that load on mount
if (!global.fetch) {
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({
      data: [],
      pagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    }),
  }));
}
