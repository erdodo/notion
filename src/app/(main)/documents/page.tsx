'use client';

import { FileText, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createDocument } from '../_actions/documents';

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }
  }, [status, router]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const document = await createDocument('Untitled');
      router.push(`/documents/${document.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <FileText className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-medium">Welcome to your workspace</h2>
      <p className="text-muted-foreground">Create a new page to get started</p>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        data-testid="new-page-button"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        New Page
      </button>
    </div>
  );
}
