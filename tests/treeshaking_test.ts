/**
 * Tests to verify tree-shaking effectiveness of subpath exports.
 *
 * When a user imports from a subpath (e.g. `jsr:@katayama8000/backlog-ts/space`),
 * only the modules required by that subpath should be loaded — other domain
 * modules must NOT appear in the dependency graph.
 *
 * This is verified by running `deno info --json <file>` and checking the
 * resolved module list.
 */
import { assertEquals } from "@std/assert";

/** Domain module basenames shared by all subpaths */
const SHARED_MODULES = new Set([
  "config.ts",
  "entities.ts",
  "params.ts",
  "request.ts",
  "types.ts",
]);

/** All domain-specific files */
const ALL_DOMAIN_MODULES = [
  "space.ts",
  "issue.ts",
  "project.ts",
  "document.ts",
  "user.ts",
];

/**
 * Returns the set of filenames (basename only) in the dependency graph of
 * the given source file, using `deno info --json`.
 */
async function getModuleGraph(filePath: string): Promise<Set<string>> {
  const cmd = new Deno.Command("deno", {
    args: ["info", "--json", filePath],
    stdout: "piped",
    stderr: "piped",
  });
  const { stdout } = await cmd.output();
  const json = JSON.parse(new TextDecoder().decode(stdout));

  return new Set<string>(
    // deno-lint-ignore no-explicit-any
    json.modules.map((m: any) => m.specifier.split("/").at(-1) as string),
  );
}

const ROOT = new URL("../src/", import.meta.url);

// ---------------------------------------------------------------------------
// Each subpath should include only itself + shared modules
// ---------------------------------------------------------------------------

for (const domain of ALL_DOMAIN_MODULES) {
  const domainName = domain.replace(".ts", "");
  const otherDomains = ALL_DOMAIN_MODULES.filter((d) => d !== domain);

  Deno.test(
    `tree-shaking: importing /${domainName} does not pull in other domain modules`,
    async () => {
      const filePath = new URL(domain, ROOT).pathname;
      const graph = await getModuleGraph(filePath);

      // Must contain itself
      assertEquals(graph.has(domain), true, `Expected ${domain} in graph`);

      // Must contain all shared modules
      for (const shared of SHARED_MODULES) {
        assertEquals(
          graph.has(shared),
          true,
          `Expected shared module ${shared} in graph`,
        );
      }

      // Must NOT contain other domain modules
      for (const other of otherDomains) {
        assertEquals(
          graph.has(other),
          false,
          `Domain ${domain} should NOT pull in ${other}, but it does`,
        );
      }
    },
  );
}

// ---------------------------------------------------------------------------
// mod.ts (full entry point) should include ALL domain modules
// ---------------------------------------------------------------------------

Deno.test("tree-shaking: mod.ts includes all domain modules", async () => {
  const filePath = new URL("mod.ts", ROOT).pathname;
  const graph = await getModuleGraph(filePath);

  for (const domain of ALL_DOMAIN_MODULES) {
    assertEquals(graph.has(domain), true, `Expected ${domain} in mod.ts graph`);
  }

  for (const shared of SHARED_MODULES) {
    assertEquals(graph.has(shared), true, `Expected ${shared} in mod.ts graph`);
  }
});
