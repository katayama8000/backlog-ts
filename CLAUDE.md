# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

backlog-ts is a TypeScript API client for Backlog, a project management and collaboration tool, built for the Deno runtime. The library provides a type-safe interface to interact with Backlog's API endpoints, with zero external dependencies (using only Deno standard library).

## Common Development Commands

### Testing

```bash
# Run unit and mock server tests (fast, no real API calls)
deno task test

# Run all tests (unit, mock, and integration tests)
# Requires environment variables to be set for integration tests
deno task test:all

# Run only integration tests (real API calls)
deno task test:integration

# Run tests in watch mode
deno task test:watch
```

### Code Quality

```bash
# Format code
deno task fmt

# Lint code
deno task lint

# Type check code
deno task check
```

### Development

```bash
# Development mode with file watching
deno task dev
```

## Integration Testing Setup

To run integration tests, create a `.env` file with the necessary credentials:

```bash
cp .env.example .env
# Edit .env with your Backlog space credentials
```

Required variables:

- `BACKLOG_HOST`: Your Backlog space host (e.g., "your-space.backlog.com")
- `BACKLOG_API_KEY`: Your API key OR
- `BACKLOG_ACCESS_TOKEN`: Your OAuth2 access token

For specific tests:

- `BACKLOG_PROJECT_ID_OR_KEY`: Project ID or key for document-related tests
- `BACKLOG_DOCUMENT_ID`: Document ID for document-specific tests
- `BACKLOG_ATTACHMENT_ID`: Attachment ID for download tests
- `BACKLOG_ALLOW_WRITE_TESTS=true`: Enable tests that modify data (use caution)

## Project Architecture

### Core Structure

- **Function-based design**: No classes, just pure functions for maintainability and testability
- **Module organization**: Each API domain has its own file
- **Type safety**: Comprehensive TypeScript types for API requests and responses

### Key Components

- `src/mod.ts`: Main entry point and API client factory
- `src/config.ts`: Configuration types and utilities
- `src/request.ts`: HTTP request handling functionality
- `src/types.ts`, `src/entities.ts`, `src/params.ts`: Type definitions for the API
- Domain-specific modules:
  - `src/space.ts`: Space-related API functions
  - `src/issue.ts`: Issue-related API functions
  - `src/project.ts`: Project-related API functions
  - `src/document.ts`: Document-related API functions

### Client Architecture

The project uses a factory pattern with `createClient()` that returns an object implementing the `BacklogClient` interface. This client wraps all API functions with the provided configuration.

### Testing Architecture

The project has three types of tests:

1. **Unit tests**: Basic tests for type structures and client creation
2. **Mock server tests**: Uses Deno's HTTP server to mock API responses
3. **Integration tests**: Makes real API calls to Backlog

## Adding New API Endpoints

When implementing a new API endpoint:

1. Add the function to the relevant domain file (e.g., `src/project.ts`)
2. Export it from `src/mod.ts`
3. Add it to the `BacklogClient` interface and the `createClient` factory function
4. Add unit/mock tests and integration tests

## Coding Guidelines

- No classes, use function-based architecture
- Use camelCase for variables and functions
- Use JSDoc comments for all public APIs
- Include references to the Backlog API documentation
- Implement comprehensive tests for all API functions

## Debugging Tips

- For mock server tests, look at the `tests/test_utils.ts` file to understand how to create mock responses
- For integration tests failing, check the `.env` file for correct credentials
- Ensure the environment variables match the test expectations (document IDs, etc.)
