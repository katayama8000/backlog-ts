# backlog-ts

[![CI](https://github.com/katayama8000/backlog-ts/workflows/CI/badge.svg)](https://github.com/katayama8000/backlog-ts/actions)
[![codecov](https://codecov.io/gh/katayama8000/backlog-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/katayama8000/backlog-ts)
[![JSR](https://jsr.io/badges/@backlog/backlog-ts)](https://jsr.io/@katayama8000/backlog-ts)

A Backlog API client for Deno

## Features

- 🦕 Built for Deno runtime
- 📦 Zero external dependencies (uses Deno standard library only)
- 🔒 Fully type-safe API client
- � Function-based design (no classes)
- 🔑 Supports API Key and OAuth2 authentication
- ✅ Comprehensive test coverage with mock servers

## Installation

```typescript
import { createClient } from 'jsr:@backlog/backlog-ts';
```

## Usage

### API Key Authentication

```typescript
import { createClient } from './src/mod.ts';

const client = createClient({
  host: 'your-space.backlog.com',
  apiKey: 'your-api-key',
});

// Get space information
const space = await client.getSpace();
console.log(space);

// Get recent activities
const activities = await client.getSpaceActivities({
  count: 20,
  order: 'desc',
});
console.log(activities);
```

### OAuth2 Authentication

```typescript
import { createClient } from './src/mod.ts';

const client = createClient({
  host: 'your-space.backlog.com',
  accessToken: 'your-oauth2-access-token',
});

const space = await client.getSpace();
console.log(space);
```

## Available APIs

### Space APIs

- `getSpace()` - Get space information
- `getSpaceActivities(params)` - Get recent activities
- `getSpaceIcon()` - Download space icon/logo
- `getSpaceNotification()` - Get space notification
- `putSpaceNotification(params)` - Update space notification

More APIs are being implemented. See [DEVELOPMENT.md](./DEVELOPMENT.md) for the roadmap.

## Development

### Prerequisites

- Deno 2.0 or later

### Running Tests

```bash
# Run unit and mock tests only (fast, no real API calls)
deno task test

# Run all tests including integration tests
deno task test:all

# Run integration tests only (requires .env configuration)
deno task test:integration

# Watch mode
deno task test:watch
```

### Integration Tests

Integration tests make real API calls to Backlog. To run them:

1. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:

   ```bash
   BACKLOG_HOST=your-space.backlog.com
   BACKLOG_API_KEY=your-api-key
   ```

3. Run integration tests:
   ```bash
   deno task test:integration
   ```

**Warning messages will be displayed:**

- ⚠️ Warning when integration tests are enabled
- 🚨 Critical warning when write tests are enabled (`BACKLOG_ALLOW_WRITE_TESTS=true`)

### Code Quality

```bash
# Format code
deno task fmt

# Lint code
deno task lint

# Type check
deno task check
```

## Project Structure

```
backlog-ts/
├── deno.json           # Deno configuration
├── src/
│   ├── mod.ts         # Main entry point
│   ├── config.ts      # Configuration types
│   ├── types.ts       # Common types
│   ├── params.ts      # API parameter types
│   ├── entities.ts    # API response entity types
│   ├── request.ts     # HTTP request handler
│   └── space.ts       # Space API implementations
└── tests/
    ├── client_test.ts      # Client creation tests
    ├── params_test.ts      # Parameter structure tests
    ├── request_test.ts     # HTTP request tests (mocked)
    ├── space_test.ts       # Space API tests (mocked)
    └── integration_test.ts # Real API integration tests
```

## Contributing

Please read [DEVELOPMENT.md](./DEVELOPMENT.md) for details on our coding standards and development workflow.

## Publishing to JSR

This package is published to [JSR (JavaScript Registry)](https://jsr.io/@backlog/backlog-ts).

### Manual Publishing

```bash
# Make sure all tests pass
deno task test

# Dry run to check what will be published
deno publish --dry-run

# Publish to JSR
deno publish
```

### Automatic Publishing via GitHub Actions

When you push a version tag, the package is automatically published to JSR:

```bash
# Create and push a tag
git tag v0.1.0
git push origin v0.1.0
```

The GitHub Actions workflow will automatically:

1. Run linter
2. Run formatter check
3. Run type check
4. Run all tests
5. Publish to JSR

## License

MIT

## Related Links

- [Backlog API Documentation](https://developer.nulab.com/docs/backlog/)
- [Deno Documentation](https://deno.land/)
