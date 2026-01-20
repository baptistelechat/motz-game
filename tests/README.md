# Test Suite

## Structure

- `e2e/`: End-to-End tests (Playwright)
- `api/`: API Integration tests
- `components/`: Components tests
- `unit/`: Unit tests (Vitest)
- `support/`: Fixtures, Factories, Helpers

## Execution

- **E2E**: `pnpm test:e2e`
- **Unit**: `pnpm test:unit`

## Priorities

- **[P0]**: Critical path (Login, Core Game Loop)
- **[P1]**: High priority (Settings, Leaderboard)
- **[P2]**: Medium priority (Edge cases)
- **[P3]**: Low priority (Cosmetic, rare flows)
