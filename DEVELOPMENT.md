# Development Guide

This document provides detailed information for developers working on backlog-ts.

## Project Overview

backlog-ts is a Deno-based API client for Backlog, ported from the original [backlog-js](https://github.com/nulab/backlog-js) project.

**Key Design Principles:**

- Function-based architecture (no classes)
- Type-safe API design
- Comprehensive test coverage
- Zero external dependencies

## Project Structure

```
backlog-ts/
├── deno.json              # Deno configuration and tasks
├── README.md              # User-facing documentation
├── DEVELOPMENT.md         # This file
├── .gitignore            # Git ignore patterns
├── .env.example          # Environment variable template
├── src/                  # Source code
│   ├── mod.ts           # Main entry point, exports public API
│   ├── config.ts        # Configuration and error types
│   ├── types.ts         # Common types (enums, unions)
│   ├── params.ts        # API parameter interfaces
│   ├── entities.ts      # API response entity interfaces
│   ├── request.ts       # HTTP request handler functions
│   └── space.ts         # Space API implementation
└── tests/               # Test files
    ├── client_test.ts      # Client creation tests
    ├── params_test.ts      # Parameter type tests
    ├── request_test.ts     # HTTP request tests (mocked)
    ├── space_test.ts       # Space API tests (mocked)
    └── integration_test.ts # Real API integration tests
```

## Implemented Features

### Core Functionality

- ✅ Project configuration (`deno.json`)
- ✅ Type definitions (`config.ts`, `types.ts`, `params.ts`, `entities.ts`)
- ✅ HTTP request handling (`request.ts`)
- ✅ Client factory function (`createClient`)

### Space APIs

- ✅ `getSpace` - Retrieve space information
- ✅ `getSpaceActivities` - Retrieve recent updates
- ✅ `getSpaceIcon` - Download space logo
- ✅ `getSpaceNotification` - Get space notification
- ✅ `putSpaceNotification` - Update space notification

### Issue APIs

- ✅ `postIssue` - Create a new issue
- ✅ `getIssue` - Get issue by ID or key
- ✅ `getIssues` - Get issue list with filters
- ✅ `getIssueCount` - Get issue count with filters

### Authentication

- ✅ API Key authentication
- ✅ OAuth2 token authentication

## Development Commands

```bash
# Run unit and mock tests only (fast, no API key required)
deno task test

# Run all tests including integration tests
deno task test:all

# Run integration tests only
deno task test:integration

# Run tests in watch mode
deno task test:watch

# Type checking
deno task check

# Linting
deno task lint

# Code formatting
deno task fmt
```

## Testing Strategy

### Unit Tests

Simple tests that verify type structures and client creation without making network requests.

- `tests/client_test.ts` - Client factory function tests
- `tests/params_test.ts` - Parameter interface tests

### Mock Server Tests (Recommended)

Tests that use Deno's built-in HTTP server to mock Backlog API responses. These tests:

- Run fast (no real network calls)
- Don't require API credentials
- Test HTTP request/response handling
- Verify error handling

Files:

- `tests/request_test.ts` - HTTP request handling (GET, POST, PUT, DELETE, timeouts, errors)
- `tests/space_test.ts` - Space API endpoints with various scenarios

### Integration Tests (Real API)

Tests that make actual API calls to Backlog. These tests:

- Verify real API compatibility
- Require valid credentials
- Are slower and rate-limited
- Can be used for manual verification

File: `tests/integration_test.ts`

## Running Integration Tests

Integration tests require Backlog API credentials and make real API calls.

### Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```bash
   BACKLOG_HOST=your-space.backlog.com
   BACKLOG_API_KEY=your-api-key
   # OR
   # BACKLOG_ACCESS_TOKEN=your-oauth2-token
   ```

### Execution

```bash
# Run integration tests only
deno task test:integration
# Output:
# ⚠️  WARNING: Integration tests are enabled!
# 📡 Real API calls will be made to: your-space.backlog.com
# 💡 These tests will READ data from your Backlog space.

# Run all tests (unit + mock + integration)
deno task test:all
```

### Write Tests (Data Modification)

By default, integration tests only perform read operations. To enable write tests:

```bash
export BACKLOG_ALLOW_WRITE_TESTS=true
deno task test:integration
# Output:
# 🚨 CRITICAL WARNING: Write tests are ENABLED!
# ✏️  These tests will MODIFY data in your Backlog space!
# ⚠️  Make sure you are using a test/development space.
```

**Warning:** Write tests will modify data in your Backlog space. Only use this with test/development spaces.

## Warning Messages

Integration tests display warning messages to prevent accidental data modification:

### Read-Only Tests

```
⚠️  WARNING: Integration tests are enabled!
📡 Real API calls will be made to: your-space.backlog.com
💡 These tests will READ data from your Backlog space.
```

### Write Tests

```
🚨 CRITICAL WARNING: Write tests are ENABLED!
✏️  These tests will MODIFY data in your Backlog space!
⚠️  Make sure you are using a test/development space.
```

These warnings help prevent accidental production data modification.

## Coding Guidelines

Following the project's coding standards defined in `.github/copilot-instructions.md`:

### General Principles

- **No classes**: Use functions and interfaces only
- **Naming**: Use camelCase for variables, functions
- **Async operations**: Use async/await for Promise-based code
- **Error handling**: Use try/catch blocks
- **Documentation**: Write JSDoc comments for all public APIs
- **Testing**: Write tests for each API endpoint

### Code Style

- Use TypeScript
- Use Deno standard library (`@std`)
- Format with `deno fmt`
- Lint with `deno lint`
- No semicolons (Deno convention)

### Example Function Structure

```typescript
/**
 * Get space information
 * @see https://developer.nulab.com/docs/backlog/api/2/get-space/
 */
export async function getSpace(config: BacklogConfig): Promise<Space> {
  return await request<Space>(config, 'space');
}
```

## Roadmap

### Next Steps

1. Implement Project APIs
2. ✅ Implement Issue APIs
3. Implement Wiki APIs
4. Implement User APIs
5. Implement Git/SVN repository APIs
6. ✅ Set up GitHub Actions CI/CD
7. ✅ Publish to JSR (JavaScript Registry)

### Future Enhancements

- Rate limiting support
- Retry logic for failed requests
- Request/response logging
- WebHook utilities
- CLI tool

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

#### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request:

- **Linting**: `deno task lint`
- **Formatting check**: `deno fmt --check`
- **Type checking**: `deno task check`
- **Unit tests**: `deno task test`
- **Coverage**: Generates and uploads coverage reports
- **Matrix testing**: Tests on Ubuntu, macOS, and Windows

#### Integration Test Workflow

Runs on pushes to main/master branch:

- Executes integration tests if credentials are configured
- Requires GitHub secrets: `BACKLOG_HOST`, `BACKLOG_API_KEY`

#### Release Workflow (`.github/workflows/release.yml`)

Runs on version tags (e.g., `v1.0.0`):

- Runs tests
- Publishes to JSR (JavaScript Registry) as @katayama8000/backlog-ts

### Setting Up Secrets

For integration tests in CI, add these secrets to your GitHub repository:

1. Go to repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `BACKLOG_HOST`: Your Backlog space host (e.g., `your-space.backlog.com`)
   - `BACKLOG_API_KEY`: Your Backlog API key

**Note:** Integration tests in CI are optional and will be skipped if secrets are
not configured.

## Contributing

When contributing to this project:

1. Follow the coding guidelines above
2. Write tests for new features
3. Update documentation
4. Run all checks before submitting:
   ```bash
   deno task fmt
   deno task lint
   deno task check
   deno task test
   ```

## References

- [Backlog API Documentation](https://developer.nulab.com/docs/backlog/)
- [Original backlog-js](https://github.com/nulab/backlog-js)
- [Deno Manual](https://docs.deno.com/)
- [Deno Standard Library](https://jsr.io/@std)
