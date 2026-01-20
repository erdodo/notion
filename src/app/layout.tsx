import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { EdgeStoreProviderWrapper } from "@/components/providers/edgestore-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ModalProvider } from "@/components/providers/modal-provider"
import { DocumentPreviewProvider } from "@/components/providers/document-preview-provider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Notion Clone",
  description: "A Notion clone built with Next.js 14",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
                <Toaster position="bottom-center" />
                <ModalProvider />
                <DocumentPreviewProvider />
                {children}
              </ThemeProvider>
            </QueryProvider>
          </EdgeStoreProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
