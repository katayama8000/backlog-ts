# backlog-ts

[![CI](https://github.com/katayama8000/backlog-ts/workflows/CI/badge.svg)](https://github.com/katayama8000/backlog-ts/actions)
[![codecov](https://codecov.io/gh/katayama8000/backlog-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/katayama8000/backlog-ts)
[![JSR](https://jsr.io/badges/@katayama8000/backlog-ts)](https://jsr.io/@katayama8000/backlog-ts)

A Backlog API client for Deno. This library is unofficial but [the developer](https://github.com/katayama8000) who created this library works at Nulab, the company behind Backlog.

## Features

- 🦕 Built for Deno runtime
- 📦 Zero external dependencies (uses Deno standard library only)
- 🔒 Fully type-safe API client
- ⚡ Function-based design (no classes)
- 🔑 Supports API Key and OAuth2 authentication
- 📝 Configurable request/response logging
- ✅ Comprehensive test coverage with mock servers

## Installation

```typescript
import { createClient } from "jsr:@katayama8000/backlog-ts";
```

## Usage

### API Key Authentication

```typescript
import { createClient } from "jsr:@katayama8000/backlog-ts";

const client = createClient({
  host: "your-space.backlog.com",
  apiKey: "your-api-key",
});

// Get space information
const space = await client.getSpace();
console.log(space);

// Get recent activities
const activities = await client.getSpaceActivities({
  count: 20,
  order: "desc",
});
console.log(activities);
```

### OAuth2 Authentication

```typescript
import { createClient } from "jsr:@katayama8000/backlog-ts";

const client = createClient({
  host: "your-space.backlog.com",
  accessToken: "your-oauth2-access-token",
});

const space = await client.getSpace();
console.log(space);
```

### Request/Response Logging

```typescript
import { consoleLogger, createClient } from "jsr:@katayama8000/backlog-ts";

// Use built-in console logger
const client = createClient({
  host: "your-space.backlog.com",
  apiKey: "your-api-key",
  logger: consoleLogger,
});

// Or use a custom logger
const clientWithCustomLogger = createClient({
  host: "your-space.backlog.com",
  apiKey: "your-api-key",
  logger: {
    request(method, url, headers, body) {
      console.log(`[${method}] ${url}`);
    },
    response(method, url, status, headers, body, duration) {
      console.log(`[${method}] ${url} - ${status} (${duration.toFixed(2)}ms)`);
    },
    error(method, url, error, duration) {
      console.error(`[${method}] ${url} - Error: ${error}`);
    },
  },
});

// Make requests with logging
const space = await client.getSpace();
```

### Request Retry Configuration

Configure automatic retry logic for failed requests:

```typescript
import { createClient } from "jsr:@katayama8000/backlog-ts";

const client = createClient({
  host: "your-space.backlog.com",
  apiKey: "your-api-key",
  retry: {
    maxAttempts: 3, // Maximum retry attempts (default: 3)
    baseDelay: 1000, // Base delay in milliseconds (default: 1000)
    maxDelay: 30000, // Maximum delay between retries (default: 30000)
    exponentialBackoff: true, // Use exponential backoff (default: true)
    retryableStatusCodes: [ // HTTP status codes to retry (default: [429, 500, 502, 503, 504])
      429, // Too Many Requests (rate limiting)
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ],
  },
});

// Requests will be automatically retried on network errors and specified status codes
const space = await client.getSpace();
```

**Retry Behavior:**

- **Network errors** (connection timeouts, DNS failures) are automatically retried
- **Rate limiting (429)** and **server errors (5xx)** are retried by default
- **Client errors (4xx)** except rate limiting are not retried
- **Exponential backoff** with jitter helps avoid thundering herd issues
- **Maximum delay** prevents excessively long wait times

To disable retry completely:

```typescript
const client = createClient({
  host: "your-space.backlog.com",
  apiKey: "your-api-key",
  retry: {
    maxAttempts: 1, // Disable retry
  },
});
```

## Available APIs

### Space APIs

- `getSpace()` - Get space information
- `getSpaceActivities(params)` - Get recent activities
- `getSpaceIcon()` - Download space icon/logo
- `getSpaceNotification()` - Get space notification
- `putSpaceNotification(params)` - Update space notification

### Issue APIs

- `postIssue(params)` - Create a new issue
- `getIssue(issueIdOrKey)` - Get issue by ID or key
- `getIssues(params)` - Get issue list with filters
- `getIssueCount(params)` - Get issue count

### Project APIs

- `getProjects(params)` - Get project list
- `getProject(projectIdOrKey)` - Get project by ID or key

### Document APIs

- `getDocuments(params)` - Get document list
- `getDocument(documentId)` - Get document by ID
- `getDocumentTree(params)` - Get document tree
- `downloadDocumentAttachment(documentId, attachmentId)` - Download a document attachment

### User APIs

- `getUsers()` - Get user list
- `getUser(userId)` - Get user by ID
- `postUser(params)` - Add a new user (Not available in new plan spaces)
- `patchUser(userId, params)` - Update user information (Not available in new plan spaces)
- `deleteUser(userId)` - Delete a user (Not available in new plan spaces)
- `getMyself()` - Get own user information
- `getUserIcon(userId)` - Download user icon
- `getUserActivities(userId, params)` - Get user's recent activities
- `getUserStars(userId, params)` - Get stars received by user
- `getUserStarsCount(userId, params)` - Count user's received stars
- `getRecentlyViewedIssues(params)` - Get recently viewed issues
- `getRecentlyViewedProjects(params)` - Get recently viewed projects
- `getRecentlyViewedWikis(params)` - Get recently viewed wikis

More APIs are being implemented.

## Contributing

Contributions are welcome! Please read [DEVELOPMENT.md](./DEVELOPMENT.md) for details on our coding standards and development workflow.

## License

MIT

## Related Links

- [Backlog API Documentation](https://developer.nulab.com/docs/backlog/)
- [Deno Documentation](https://deno.land/)
