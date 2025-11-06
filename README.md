# backlog-ts

[![CI](https://github.com/katayama8000/backlog-ts/workflows/CI/badge.svg)](https://github.com/katayama8000/backlog-ts/actions)
[![codecov](https://codecov.io/gh/katayama8000/backlog-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/katayama8000/backlog-ts)
[![JSR](https://jsr.io/badges/@katayama8000/backlog-ts)](https://jsr.io/@katayama8000/backlog-ts)

A Backlog API client for Deno.

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

More APIs are being implemented.

## Contributing

Contributions are welcome! Please read [DEVELOPMENT.md](./DEVELOPMENT.md) for details on our coding standards and development workflow.

## License

MIT

## Related Links

- [Backlog API Documentation](https://developer.nulab.com/docs/backlog/)
- [Deno Documentation](https://deno.land/)
