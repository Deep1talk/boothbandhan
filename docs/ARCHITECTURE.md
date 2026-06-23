# Project Structure

This project now follows a more feature-oriented structure without changing route URLs:

- `app/`
  Next.js routes, layouts, and route handlers.
- `components/Application/`
  UI sections and dashboard shells.
- `hooks/`
  Reusable client hooks such as remote data loading.
- `lib/client/`
  Browser-side API helpers.
- `lib/server/`
  Server-side request guards and route utilities.
- `lib/users/`
  Shared user-domain queries and payload presenters.

## Refactor Direction

The current codebase is being standardized around:

- thin route handlers
- shared domain queries
- shared client API wrappers
- reusable fetch/loading state hooks

## Recommended Next Steps

1. Move auth route logic into `lib/auth/` domain modules.
2. Replace Redux auth state with server-session driven UI if client auth state stays unused.
3. Split `components/Application/` into `components/admin`, `components/candidate`, `components/shared`.
4. Add test coverage around user queries and account/profile flows.
