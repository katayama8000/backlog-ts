import type { BacklogConfig } from "./config.ts";
import type { Document } from "./entities.ts";
import type { GetDocumentsParams } from "./params.ts";
import { request } from "./request.ts";

/**
 * Get document list
 * @see https://developer.nulab.com/docs/backlog/api/2/get-document-list/
 */
export async function getDocuments(
  config: BacklogConfig,
  params: GetDocumentsParams,
): Promise<Document[]> {
  return await request<Document[]>(config, "documents", { params });
}

/**
 * Get document
 * @see https://developer.nulab.com/docs/backlog/api/2/get-document/
 */
export async function getDocument(
  config: BacklogConfig,
  documentId: string,
): Promise<Document> {
  return await request<Document>(config, `documents/${documentId}`);
}
