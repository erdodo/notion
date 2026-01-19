"use client"

import { useEffect, useState } from "react"
import { SearchCommand } from "@/components/search-command"
import { SettingsModal } from "@/components/modals/settings-modal"
import { MovePageModal } from "@/components/modals/move-page-modal"
import { RenameModal } from "@/components/modals/rename-modal"
import { HistoryModal } from "@/components/modals/history-modal"

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
      <MovePageModal />
      <RenameModal />
      <HistoryModal />
    </>
  )
}
