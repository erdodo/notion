import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';
import { NextRequest } from 'next/server';

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket()
    .beforeUpload(() => {
      return true; // Allow upload
    })
});

// Check if EdgeStore credentials are configured
const hasEdgeStoreCredentials = 
  process.env.EDGE_STORE_ACCESS_KEY && 
  process.env.EDGE_STORE_SECRET_KEY;

let handler: any;

if (hasEdgeStoreCredentials) {
  handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
  });
} else {
  // Fallback handler for when credentials are not configured
  handler = {
    GET: async (req: NextRequest) => {
      return new Response(
        JSON.stringify({ error: 'EdgeStore is not configured. Please set EDGE_STORE_ACCESS_KEY and EDGE_STORE_SECRET_KEY environment variables.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    },
    POST: async (req: NextRequest) => {
      return new Response(
        JSON.stringify({ error: 'EdgeStore is not configured. Please set EDGE_STORE_ACCESS_KEY and EDGE_STORE_SECRET_KEY environment variables.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;
