import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  // Cover images - only images, max 4MB
  coverImages: es.fileBucket({
    accept: ["image/*"],
    maxSize: 1024 * 1024 * 4, // 4MB
  }).beforeDelete(() => true), // Allow delete

  // Editor media (images, videos, audio)
  editorMedia: es.fileBucket({
    accept: ["image/*", "video/*", "audio/*"],
    maxSize: 1024 * 1024 * 50, // 50MB
  }).beforeDelete(() => true), // Allow delete

  // Document attachments
  documentFiles: es.fileBucket({
    maxSize: 1024 * 1024 * 100, // 100MB
  }).beforeDelete(() => true), // Allow delete
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export const GET = handler;
export const POST = handler;

export type EdgeStoreRouter = typeof edgeStoreRouter;
