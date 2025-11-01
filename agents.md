This project is a Deno port of backlog-js.
For the Backlog API reference, see https://developer.nulab.com/docs/backlog/

Authentication supports both API Key and OAuth 2.0.

# Coding Standards

- Use TypeScript
- Use camelCase for variable names, function names, and class names
- Implement using functions and interfaces (no classes)
- Use async/await for asynchronous functions that return Promises
- Use try/catch for error handling
- Implement test code for each endpoint
- Always write documentation comments
- Use deno fmt and deno lint for code formatting and linting
- **Always use double quotes (") for strings, not single quotes (')**
- Write commit messages in English
- Write Pull Request descriptions in English
- Implement CI/CD using GitHub Actions
- Follow SemVer for version management
- Refer to the existing backlog-js implementation as needed

# Development Process

When adding a new API endpoint, follow these steps:

1.  **Implement the API function:** Add the new function to the relevant file in the `src/` directory (e.g., `src/document.ts` for document-related APIs).
2.  **Export the function:** Export the new function from `src/mod.ts` and add it to the `BacklogClient` interface and the `createClient` factory function.
3.  **Add a unit test:** Create a unit test for the new function in the corresponding file under the `tests/` directory (e.g., `tests/document_test.ts`). Mock the API response to test the function in isolation.
4.  **Add an integration test:** Add an integration test for the new function in `tests/integration_test.ts`. This test will make a real API call to the Backlog service.

# Testing

## Running Tests

To run all tests, use the following command:

```bash
deno test --allow-net --allow-read --allow-env
```

- `--allow-net`: Required for the mock server in unit tests and for real API calls in integration tests.
- `--allow-read`: Required to read the `.env` file for integration tests.
- `--allow-env`: Required to access environment variables for integration tests.

## Integration Tests

Integration tests make real API calls to your Backlog space and require credentials.

1.  **Create a `.env` file:** Copy the `.env.example` file to a new file named `.env`.
2.  **Set environment variables:** Fill in the required variables in the `.env` file, such as `BACKLOG_HOST`, `BACKLOG_API_KEY`, and any other variables needed for the specific test (e.g., `BACKLOG_DOCUMENT_ID`, `BACKLOG_ATTACHMENT_ID`).

The integration tests are designed to be skipped if the required environment variables are not set.
