"use client"

import { useContextMenuStore } from "@/store/use-context-menu-store"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SidebarPageMenu } from "./menus/sidebar-page-menu"
import { TrashItemMenu } from "./menus/trash-item-menu"
import { EditorBlockMenu } from "./menus/editor-block-menu"
import { IconMenu } from "./menus/icon-menu"
import { CoverImageMenu } from "./menus/cover-image-menu"
import { DatabaseRowMenu } from "./menus/database-row-menu"
import { DatabaseCellMenu } from "./menus/database-cell-menu"
import { InterfaceElementMenu } from "./menus/interface-element-menu"
import { useEffect, useState } from "react"

export const GlobalContextMenu = () => {
    const { isOpen, position, type, closeContextMenu, data } = useContextMenuStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    if (!isOpen) return null

    const renderMenuContent = () => {
        switch (type) {
            case "sidebar-page":
                return <SidebarPageMenu data={data as any} />
            case "trash-item":
                return <TrashItemMenu data={data as any} />
            case "editor-block":
                return <EditorBlockMenu data={data as any} />
            case "icon":
                return <IconMenu data={data as any} />
            case "cover-image":
                return <CoverImageMenu data={data as any} />
            case "interface-element":
                return <InterfaceElementMenu data={data as any} />
            case "database-cell":
                return <DatabaseCellMenu data={data as any} />
            case "database-row":
                return <DatabaseRowMenu data={data as any} />
            default:
                return null
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={(open) => !open && closeContextMenu()}>
            <DropdownMenuTrigger
                className="fixed w-0 h-0 p-0 m-0 opacity-0 pointer-events-none"
                style={{
                    left: position.x,
                    top: position.y,
                }}
            />
            <DropdownMenuContent
                className="w-64"
                align="start"
                side="bottom"
                // Force the content to be close to the trigger point
                sideOffset={0}
                alignOffset={0}
            >
                {renderMenuContent()}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
