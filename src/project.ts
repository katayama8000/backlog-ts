import type { BacklogConfig } from './config.ts';
import type { Project } from './entities.ts';
import type { GetProjectsParams } from './params.ts';
import { request } from './request.ts';

/**
 * Get project list
 * @see https://developer.nulab.com/docs/backlog/api/2/get-project-list/
 */
export async function getProjects(
  config: BacklogConfig,
  params?: GetProjectsParams
): Promise<Project[]> {
  return await request<Project[]>(config, 'projects', { params });
}

/**
 * Get project
 * @see https://developer.nulab.com/docs/backlog/api/2/get-project/
 */
export async function getProject(
  config: BacklogConfig,
  projectIdOrKey: string | number
): Promise<Project> {
  return await request<Project>(config, `projects/${projectIdOrKey}`);
}
