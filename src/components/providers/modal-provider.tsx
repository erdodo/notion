"use client"

import { useEffect, useState } from "react"
import { SearchCommand } from "@/components/search-command"
import { SettingsModal } from "@/components/modals/settings-modal"

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <SearchCommand />
      <SettingsModal />
    </>
  )
}
