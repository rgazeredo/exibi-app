# AGENTS.md - Guidelines for Agentic Coding in Exibi

This file provides guidance for agentic coding agents working in the Exibi codebase.

## Project Overview

Exibi is a digital signage platform with:

- **Backend**: Laravel 12 + Inertia.js
- **Frontend**: React 19 + React Compiler + TypeScript + Tailwind CSS v4
- **Database**: PostgreSQL with UUIDs
- **Testing**: Pest (PHP) + Jest-style expectations
- **Real-time**: Soketi (WebSocket)

---

## Build, Lint, and Test Commands

### Frontend (Node.js)

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start Vite dev server                     |
| `npm run build`        | Production build                          |
| `npm run types`        | TypeScript type checking (`tsc --noEmit`) |
| `npm run lint`         | ESLint with autofix                       |
| `npm run format`       | Prettier formatting (fixes)               |
| `npm run format:check` | Check formatting without fixing           |

### Backend (PHP/Laravel)

| Command                                                      | Description                          |
| ------------------------------------------------------------ | ------------------------------------ |
| `./vendor/bin/pint`                                          | Run Laravel Pint (PHP linting/style) |
| `composer test`                                              | Run tests via artisan                |
| `php artisan test`                                           | Run all Pest tests                   |
| `php artisan test --filter=TestName`                         | Run single test                      |
| `php artisan test tests/Feature/PlaylistInterleavedTest.php` | Run specific test file               |

### Docker Development

| Command        | Description                                           |
| -------------- | ----------------------------------------------------- |
| `make install` | First-time setup: build, start, install deps, migrate |
| `make up`      | Start containers                                      |
| `make down`    | Stop containers                                       |
| `make logs`    | Follow container logs                                 |
| `make shell`   | Open shell in app container                           |
| `make fresh`   | Fresh migration with seeders                          |
| `make test`    | Run tests (uses exibi_test database)                  |
| `make pint`    | Run Laravel Pint                                      |

---

## Code Style Guidelines

### General

- **NEVER add comments** unless explicitly required by the user
- Follow existing patterns in the codebase - match the style of surrounding code
- Use existing libraries and utilities rather than adding new dependencies

### PHP (Laravel)

- **Formatter**: Laravel Pint (PSR-12 based, configured in `pint.json`)
- Run `./vendor/bin/pint` before committing PHP changes
- **Classes**: PascalCase (e.g., `DashboardController`)
- **Methods/variables**: camelCase
- **Imports**: Group in order: Laravel Framework, PHP built-ins, third-party, app models
- **Traits**: Use `BelongsToTenant` trait for tenant-scoped models
- **Error handling**: Use Laravel exceptions and try-catch blocks as appropriate
- **Database**: Use Eloquent ORM with UUID primary keys (`HasUuids` trait)

```php
// Example controller structure
<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Use query builder methods
        $items = Model::query()
            ->with(['relation'])
            ->where('tenant_id', $tenantId)
            ->latest()
            ->paginate();

        return Inertia::render('page', ['data' => $items]);
    }
}
```

### TypeScript/JavaScript (React)

- **Formatter**: Prettier with plugins (`prettier-plugin-organize-imports`, `prettier-plugin-tailwindcss`)
- **Linter**: ESLint (flat config) with React and TypeScript support
- **TypeScript**: Strict mode enabled (`tsconfig.json`)
- **Tabs**: 4 spaces for most files, 2 spaces for YAML files
- **Semicolons**: Enabled
- **Single quotes**: Enabled
- **Imports**: Use path alias `@/*` which maps to `resources/js/`

```typescript
// Example component structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Props {
    title: string;
    items: Item[];
    onSubmit: (data: FormData) => void;
}

export default function ComponentName({ title, items, onSubmit }: Props) {
    const [loading, setLoading] = useState(false);

    return (
        <div className={cn("container", "p-4")}>
            <Button variant="default" size="sm">
                {title}
            </Button>
        </div>
    );
}
```

### React Component Conventions

- Use **function components** (not arrow functions)
- Use hooks for state/effects (`useState`, `useEffect`, `useCallback`, etc.)
- Use `cn()` from `@/lib/utils` for conditional class merging (combines `clsx` + `tailwind-merge`)
- Use `cva` (class-variance-authority) for component variants
- Define interfaces/props above the component
- Use named exports for components: `export default function Name()`
- Import types using `import type { Type }` for better tree-shaking

### Tailwind CSS v4

- Uses `@tailwindcss/vite` plugin
- Use `cn()` utility for conditional classes
- Tailwind configured in `resources/css/app.css`
- Custom color tokens in CSS variables

### Component Structure

```
resources/js/
├── components/
│   ├── ui/           # shadcn/ui primitives
│   └── *.tsx         # Feature components
├── pages/            # Inertia page components
├── layouts/           # Layout components
├── hooks/             # Custom hooks
├── lib/               # Utilities (utils.ts)
└── types/             # TypeScript type definitions
```

---

## Architecture Patterns

### Multi-Tenancy

- All tenant-scoped models use `BelongsToTenant` trait
- Tenant context set via `SetCurrentTenant` middleware
- Routes requiring tenant use `['auth', 'verified', 'tenant']` middleware

### API Authentication

- Web: Laravel Fortify (session-based) with optional 2FA
- Player API: Bearer token (`api_token` field on Player model)
- Use `player.auth` middleware for player API routes

### Inertia Pages

- Server-side rendering with React 19
- SSR via `php artisan inertia:start-ssr`
- Use `useT` hook for i18n translations

---

## Testing Guidelines

- Use **Pest** testing framework (built on PHPUnit)
- Tests live in `tests/Feature/` and `tests/Unit/`
- Test database: `exibi_test` (configured in `phpunit.xml`)
- Use `actingAs()` for authenticated requests
- Use model factories for test data

```php
// Example Pest test
it('can create playlist', function () {
    $user = actingAsUser();

    $response = post('/playlists', [
        'name' => 'Test Playlist',
    ]);

    $response->assertRedirect();
    expect(Playlist::count())->toBe(1);
});
```

---

## Important Files and Locations

| Path                          | Description               |
| ----------------------------- | ------------------------- |
| `app/Http/Controllers/`       | Web controllers (Inertia) |
| `app/Http/Controllers/Api/`   | Player API controllers    |
| `app/Services/`               | Business logic services   |
| `app/Jobs/`                   | Queue jobs                |
| `app/Models/`                 | Eloquent models           |
| `resources/js/pages/`         | Inertia page components   |
| `resources/js/components/`    | Reusable React components |
| `resources/js/components/ui/` | shadcn/ui components      |
| `resources/js/locales/`       | i18n translations         |
| `lang/`                       | Backend translation files |
| `routes/`                     | Route definitions         |

---

## Environment

- **Production**: Subdomain routing (`app.exibi.com.br`)
- **Local**: No subdomains on `localhost:8000`
- **Storage**: S3-compatible (Backblaze B2 in production, MinIO locally)
- **Services**: PostgreSQL 16, Redis 7, Soketi (WebSocket)

---

## Common Development Tasks

### Running a single test

```bash
php artisan test --filter=PlaylistInterleavedTest
# or
php artisan test tests/Feature/PlaylistInterleavedTest.php
```

### Running linting

```bash
npm run lint       # JavaScript/TypeScript
./vendor/bin/pint  # PHP
```

### Type checking

```bash
npm run types      # TypeScript
```
