import type { Metadata } from "next"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { EdgeStoreProviderWrapper } from "@/components/providers/edgestore-provider"
import { ModalProvider } from "@/components/providers/modal-provider"
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans">
          <EdgeStoreProviderWrapper>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="notion-theme"
            >
              <Toaster position="bottom-center" />
              <ModalProvider />
              {children}
            </ThemeProvider>
          </EdgeStoreProviderWrapper>
        </body>
      </html>
    </ClerkProvider>
  )
}
