import { FileText } from 'lucide-react';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user && process.env.TEST_MODE !== 'true') {
    redirect('/sign-in');
  }

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <FileText className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-medium">Welcome to your workspace</h2>
      <p className="text-muted-foreground">Create a new page to get started</p>
    </div>
  );
}
