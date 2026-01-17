"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { FileText, Loader2 } from "lucide-react"
import { useSearch } from "@/hooks/use-search"
import { searchPages } from "@/actions/page"
import { useDebounce } from "use-debounce"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface SearchResult {
  id: string
  title: string
  icon: string | null
  parent?: {
    id: string
    title: string
    icon: string | null
  } | null
}

export const SearchCommand = () => {
  const { user } = useUser()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery] = useDebounce(searchQuery, 300)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggle = useSearch((store) => store.toggle)
  const isOpen = useSearch((store) => store.isOpen)
  const onClose = useSearch((store) => store.onClose)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      if (!user) return
      
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const pages = await searchPages(debouncedQuery)
        setResults(pages)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, user])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [toggle])

  const handleSelect = (id: string) => {
    router.push(`/documents/${id}`)
    onClose()
    setSearchQuery("")
    setResults([])
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery("")
      setResults([])
    }
    onClose()
  }

  if (!isMounted) {
    return null
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput 
        placeholder="Search pages by title or content..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchQuery.trim().length > 0 ? (
            "No results found."
          ) : (
            "Start typing to search..."
          )}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Pages">
            {results.map((page) => (
              <CommandItem
                key={page.id}
                value={`${page.id}-${page.title}`}
                onSelect={() => handleSelect(page.id)}
                className="flex items-center gap-2"
              >
                <div className="flex items-center flex-1 gap-2">
                  {page.icon ? (
                    <span className="text-lg">{page.icon}</span>
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <div className="flex flex-col flex-1">
                    <span className="truncate">{page.title}</span>
                    {page.parent && (
                      <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        {page.parent.icon && <span>{page.parent.icon}</span>}
                        <span>{page.parent.title}</span>
                      </span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
