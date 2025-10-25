/**
 * Mock server helper for testing
 */
export function createMockServer(
  handler: (req: Request) => Response | Promise<Response>,
) {
  const ac = new AbortController();
  const server = Deno.serve(
    {
      port: 0,
      signal: ac.signal,
      onListen: () => {},
    },
    handler,
  );

  return {
    get host() {
      return `localhost:${(server.addr as Deno.NetAddr).port}`;
    },
    close: () => ac.abort(),
  };
}
