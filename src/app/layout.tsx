import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ModalProvider } from "@/components/providers/modal-provider"
import { SessionProvider } from "@/components/providers/session-provider"
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
        <SessionProvider>
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
        </SessionProvider>
      </body>
    </html>
  )
}
