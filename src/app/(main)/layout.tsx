"use client"

import { Navigation } from "./_components/navigation"
import { GlobalContextMenu } from "@/components/context-menu/global-context-menu"
import { SearchCommand } from "@/components/search-command"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useSearch } from "@/hooks/use-search"
import { useSidebar } from "@/hooks/use-sidebar"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { onOpen } = useSearch()
  const { toggle } = useSidebar()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()

  useKeyboardShortcuts({
    shortcuts: [
      {
        combo: { key: "\\", meta: true },
        action: () => toggle(),
      },
      {
        combo: { key: "\\", ctrl: true },
        action: () => toggle(),
      },
      {
        combo: { key: "k", meta: true },
        action: () => onOpen(),
      },
      {
        combo: { key: "k", ctrl: true },
        action: () => onOpen(),
      },
      {
        combo: { key: "p", meta: true },
        action: () => onOpen(),
      },
      {
        combo: { key: "p", ctrl: true },
        action: () => onOpen(),
      },
      {
        combo: { key: "l", meta: true, shift: true },
        action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      {
        combo: { key: "l", ctrl: true, shift: true },
        action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      {
        combo: { key: "[", meta: true },
        action: () => router.back(),
      },
      {
        combo: { key: "[", ctrl: true },
        action: () => router.back(),
      },
      {
        combo: { key: "]", meta: true },
        action: () => router.forward(),
      },
      {
        combo: { key: "]", ctrl: true },
        action: () => router.forward(),
      },
      {
        combo: { key: "n", meta: true },
        action: async () => {
          const { createDocument } = await import("@/app/(main)/_actions/documents")
          const doc = await createDocument("Untitled")
          router.push(`/documents/${doc.id}`)
        },
      },
      {
        combo: { key: "n", ctrl: true },
        action: async () => {
          const { createDocument } = await import("@/app/(main)/_actions/documents")
          const doc = await createDocument("Untitled")
          router.push(`/documents/${doc.id}`)
        },
      }
    ]
  })

  return (
    <div className="h-full flex bg-background">
      <GlobalContextMenu />
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        {children}
      </main>
      <SearchCommand />
    </div>
  )
}

