import { assertEquals, assertExists } from '@std/assert';
import { createClient } from '../src/mod.ts';
import type { Project } from '../src/mod.ts';
import { createMockServer } from './test_utils.ts';

Deno.test('getProjects - success', async () => {
  const mockProjects: Project[] = [
    {
      id: 1,
      projectKey: 'TEST',
      name: 'Test Project',
      chartEnabled: false,
      useResolvedForChart: false,
      subtaskingEnabled: false,
      projectLeaderCanEditProjectLeader: false,
      useWiki: true,
      useFileSharing: true,
      useWikiTreeView: true,
      useSubversion: false,
      useGit: true,
      useOriginalImageSizeAtWiki: false,
      textFormattingRule: 'markdown',
      archived: false,
      displayOrder: 0,
      useDevAttributes: false,
    },
    {
      id: 2,
      projectKey: 'DEMO',
      name: 'Demo Project',
      chartEnabled: true,
      useResolvedForChart: true,
      subtaskingEnabled: true,
      projectLeaderCanEditProjectLeader: true,
      useWiki: true,
      useFileSharing: true,
      useWikiTreeView: false,
      useSubversion: false,
      useGit: true,
      useOriginalImageSizeAtWiki: false,
      textFormattingRule: 'backlog',
      archived: false,
      displayOrder: 1,
      useDevAttributes: true,
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, '/api/v2/projects');
    assertEquals(req.method, 'GET');

    return new Response(JSON.stringify(mockProjects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: 'test-key',
    });

    const projects = await client.getProjects();

    assertEquals(projects.length, 2);
    assertEquals(projects[0].projectKey, 'TEST');
    assertEquals(projects[1].projectKey, 'DEMO');
  } finally {
    server.close();
  }
});

Deno.test('getProjects - with archived filter', async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, '/api/v2/projects');
    assertEquals(url.searchParams.get('archived'), 'true');

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: 'test-key',
    });

    const projects = await client.getProjects({ archived: true });

    assertExists(projects);
    assertEquals(Array.isArray(projects), true);
  } finally {
    server.close();
  }
});

Deno.test('getProjects - with all flag', async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.searchParams.get('all'), 'true');

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: 'test-key',
    });

    await client.getProjects({ all: true });
  } finally {
    server.close();
  }
});

Deno.test('getProject - by ID', async () => {
  const mockProject: Project = {
    id: 1,
    projectKey: 'TEST',
    name: 'Test Project',
    chartEnabled: false,
    useResolvedForChart: false,
    subtaskingEnabled: false,
    projectLeaderCanEditProjectLeader: false,
    useWiki: true,
    useFileSharing: true,
    useWikiTreeView: true,
    useSubversion: false,
    useGit: true,
    useOriginalImageSizeAtWiki: false,
    textFormattingRule: 'markdown',
    archived: false,
    displayOrder: 0,
    useDevAttributes: false,
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, '/api/v2/projects/1');
    assertEquals(req.method, 'GET');

    return new Response(JSON.stringify(mockProject), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: 'test-key',
    });

    const project = await client.getProject(1);

    assertEquals(project.id, 1);
    assertEquals(project.projectKey, 'TEST');
    assertEquals(project.name, 'Test Project');
  } finally {
    server.close();
  }
});

Deno.test('getProject - by key', async () => {
  const mockProject: Project = {
    id: 1,
    projectKey: 'TEST',
    name: 'Test Project',
    chartEnabled: false,
    useResolvedForChart: false,
    subtaskingEnabled: false,
    projectLeaderCanEditProjectLeader: false,
    useWiki: true,
    useFileSharing: true,
    useWikiTreeView: true,
    useSubversion: false,
    useGit: true,
    useOriginalImageSizeAtWiki: false,
    textFormattingRule: 'markdown',
    archived: false,
    displayOrder: 0,
    useDevAttributes: false,
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, '/api/v2/projects/TEST');
    assertEquals(req.method, 'GET');

    return new Response(JSON.stringify(mockProject), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: 'test-key',
    });

    const project = await client.getProject('TEST');

    assertEquals(project.id, 1);
    assertEquals(project.projectKey, 'TEST');
    assertEquals(project.name, 'Test Project');
  } finally {
    server.close();
  }
});
