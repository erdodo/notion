import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-xl font-medium">Page not found</h2>
        <p className="text-muted-foreground text-sm">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="pt-4">
          <Button asChild variant="default">
            <Link href="/documents">Go back to documents</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
