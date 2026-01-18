"use client"

import { useCallback } from "react"
import { useComponentsContext } from "@blocknote/react"
import { BlockMenu } from "./block-menu"
import {
    convertBlockType,
    duplicateBlock,
    BlockColor,
    getBlockColorStyle
} from "@/lib/block-utils"
import { useTheme } from "next-themes"

interface BlockSideMenuProps {
    block: any
    editor: any
}

export function BlockSideMenu({ block, editor }: BlockSideMenuProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const handleConvert = useCallback((newType: string) => {
        const converted = convertBlockType(block, newType)
        editor.updateBlock(block.id, converted)
    }, [block, editor])

    const handleDuplicate = useCallback(() => {
        const duplicate = duplicateBlock(block)
        editor.insertBlocks([duplicate], block.id, "after")
    }, [block, editor])

    const handleDelete = useCallback(() => {
        editor.removeBlocks([block.id])
    }, [block, editor])

    const handleColorChange = useCallback((color: BlockColor) => {
        editor.updateBlock(block.id, {
            props: { ...block.props, backgroundColor: color }
        })
    }, [block, editor])

    return (
        <BlockMenu
            blockId={block.id}
            blockType={block.type}
            backgroundColor={block.props?.backgroundColor || "default"}
            onConvert={handleConvert}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onColorChange={handleColorChange}
        />
    )
}
