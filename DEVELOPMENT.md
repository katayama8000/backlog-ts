# Development Guide

This document provides detailed information for developers working on backlog-ts.

## Project Overview

backlog-ts is a Deno-based API client for Backlog, ported from the original [backlog-js](https://github.com/nulab/backlog-js) project.

**Key Design Principles:**

- Function-based architecture (no classes)
- Type-safe API design
- Comprehensive test coverage
- Zero external dependencies

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

### Document APIs

- ✅ `getDocuments` - Get document list
- ✅ `getDocument` - Get document by ID
- ✅ `getDocumentTree` - Get document tree
- ✅ `downloadDocumentAttachment` - Download a document attachment

### Project APIs

- ✅ `getProjects` - Get project list
- ✅ `getProject` - Get project by ID or key

### Authentication

- ✅ API Key authentication
- ✅ OAuth2 token authentication

### Utility Features

- ✅ Request/response logging
- ⬜ Rate limiting support
- ⬜ Retry logic for failed requests

## Development Process

When adding a new API endpoint, follow these steps:

1. **Implement the API function:** Add the new function to the relevant file in the `src/` directory (e.g., `src/document.ts` for document-related APIs).
2. **Export the function:** Export the new function from `src/mod.ts` and add it to the `BacklogClient` interface and the `createClient` factory function.
3. **Add a unit test:** Create a unit test for the new function in the corresponding file under the `tests/` directory (e.g., `tests/document_test.ts`). Mock the API response to test the function in isolation.
4. **Add an integration test:** Add an integration test for the new function in `tests/integration_test.ts`. This test will make a real API call to the Backlog service.

## Development Commands

- `deno task test`: Runs fast unit and mock server tests. Does not require network access beyond the mock server.
- `deno task test:all`: Runs all tests, including unit, mock, and integration tests. Requires environment variables to be set for integration tests.
- `deno task test:integration`: Runs only the integration tests, which make real API calls.
- `deno task test:watch`: Runs all tests in watch mode, re-running them when files change.
- `deno task check`: Performs type checking on the codebase.
- `deno task lint`: Lints the code for style and potential errors.
- `deno task fmt`: Formats the code according to the project's style.

## Testing

This project has three types of tests:

1. **Unit Tests:** Simple tests that verify type structures and client creation without making network requests.
2. **Mock Server Tests:** Tests that use Deno's built-in HTTP server to mock Backlog API responses. These are the preferred way to test API endpoint logic as they run fast and don't require credentials.
3. **Integration Tests:** Tests that make actual API calls to a real Backlog space. These are for verifying real-world compatibility.

### Running Tests

- To run only the fast unit and mock tests, use `deno task test`.
- To run all tests, including integration tests, use `deno task test:all`.

### Integration Tests

To run the integration tests, you need to provide credentials for a Backlog space.

1. **Create a `.env` file:**
   ```bash
   cp .env.example .env
   ```
2. **Edit `.env`:** Fill in the required variables, such as `BACKLOG_HOST`, `BACKLOG_API_KEY`, and any other variables needed for the specific test (e.g., `BACKLOG_DOCUMENT_ID`, `BACKLOG_ATTACHMENT_ID`).

The integration tests are designed to be skipped if the required environment variables are not set.

### Write Tests (Data Modification)

Some integration tests modify data in your Backlog space. These are disabled by default. To enable them, set the `BACKLOG_ALLOW_WRITE_TESTS` environment variable to `true`.

```bash
export BACKLOG_ALLOW_WRITE_TESTS=true
deno task test:integration
```

**Warning:** Only run write tests on a dedicated test space, as they will modify data.

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
  return await request<Space>(config, "space");
}
```

## Roadmap

### Next Steps

1. ✅ Implement Project APIs
2. ✅ Implement Issue APIs
3. Implement Wiki APIs
4. Implement User APIs
5. Implement Git/SVN repository APIs
6. ✅ Set up GitHub Actions CI/CD
7. ✅ Publish to JSR (JavaScript Registry)

### Future Enhancements

- ✅ Request/response logging
- Rate limiting support
- Retry logic for failed requests
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
