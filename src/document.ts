import type { BacklogConfig } from "./config.ts";
import type { Document, DocumentTree } from "./entities.ts";
import type {
  AddDocumentParams,
  GetDocumentsParams,
  GetDocumentTreeParams,
} from "./params.ts";
import { download, request } from "./request.ts";

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

/**
 * Get document tree
 * @see https://developer.nulab.com/docs/backlog/api/2/get-document-tree/
 */
export async function getDocumentTree(
  config: BacklogConfig,
  params: GetDocumentTreeParams,
): Promise<DocumentTree> {
  return await request<DocumentTree>(config, "documents/tree", { params });
}

/**
 * Download document attachment
 * @see https://developer.nulab.com/docs/backlog/api/2/get-document-attachments/
 */
export async function downloadDocumentAttachment(
  config: BacklogConfig,
  documentId: string,
  attachmentId: number,
): Promise<{ body: ArrayBuffer; fileName?: string }> {
  return await download(
    config,
    `documents/${documentId}/attachments/${attachmentId}`,
  );
}

/**
 * Add document
 * @see https://developer.nulab.com/docs/backlog/api/2/add-document/
 */
export async function addDocument(
  config: BacklogConfig,
  params: AddDocumentParams,
): Promise<Document> {
  return await request<Document>(config, "documents", {
    method: "POST",
    body: params,
  });
}
