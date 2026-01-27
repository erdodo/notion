import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-background flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex items-center gap-x-2">
            <span className="text-xl font-bold">📝</span>
            <span className="text-sm font-medium text-muted-foreground">
              Notion Clone
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 max-w-screen-2xl items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <Link href="/" className="font-medium hover:underline">
              Notion Clone
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
