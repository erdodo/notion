import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  coverImages: es
    .fileBucket({
      accept: ['image/*'],
      maxSize: 1024 * 1024 * 4,
    })
    .beforeDelete(() => true),

  editorMedia: es
    .fileBucket({
      accept: ['image/*', 'video/*', 'audio/*'],
      maxSize: 1024 * 1024 * 50,
    })
    .beforeDelete(() => true),

  documentFiles: es
    .fileBucket({
      maxSize: 1024 * 1024 * 100,
    })
    .beforeDelete(() => true),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export const GET = handler;
export const POST = handler;

export type EdgeStoreRouter = typeof edgeStoreRouter;
