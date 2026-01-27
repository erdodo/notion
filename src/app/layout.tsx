import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/components/providers/auth-provider';
import { DocumentPreviewProvider } from '@/components/providers/document-preview-provider';
import { EdgeStoreProviderWrapper } from '@/components/providers/edgestore-provider';
import { ModalProvider } from '@/components/providers/modal-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

export const metadata: Metadata = {
  title: 'Notion Clone',
  description: 'A Notion clone built with Next.js 14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          <EdgeStoreProviderWrapper>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                storageKey="notion-theme"
              >
                <SocketProvider>
                  <Toaster position="bottom-center" />
                  <ModalProvider />
                  <DocumentPreviewProvider />
                  {children}
                </SocketProvider>
              </ThemeProvider>
            </QueryProvider>
          </EdgeStoreProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
