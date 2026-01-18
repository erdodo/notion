"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Copy,
    Trash2,
    GripVertical,
    Palette,
    Type,
    List,
    ListOrdered,
    CheckSquare,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Lightbulb,
    Link2,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
    BLOCK_COLORS,
    BLOCK_COLORS_DARK,
    BlockColor,
    getAvailableConversions,
    formatBlockTypeName,
} from "@/lib/block-utils"
import { toast } from "sonner"

interface BlockMenuProps {
    blockId: string
    blockType: string
    backgroundColor?: BlockColor
    onConvert: (newType: string) => void
    onDuplicate: () => void
    onDelete: () => void
    onColorChange: (color: BlockColor) => void
    children?: React.ReactNode
}

const BLOCK_TYPE_ICONS: Record<string, React.ReactNode> = {
    paragraph: <Type className="h-4 w-4" />,
    heading: <Heading1 className="h-4 w-4" />,
    bulletListItem: <List className="h-4 w-4" />,
    numberedListItem: <ListOrdered className="h-4 w-4" />,
    checkListItem: <CheckSquare className="h-4 w-4" />,
    quote: <Quote className="h-4 w-4" />,
    callout: <Lightbulb className="h-4 w-4" />,
}

export function BlockMenu({
    blockId,
    blockType,
    backgroundColor = "default",
    onConvert,
    onDuplicate,
    onDelete,
    onColorChange,
    children,
}: BlockMenuProps) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const colors = isDark ? BLOCK_COLORS_DARK : BLOCK_COLORS
    const availableConversions = getAvailableConversions(blockType)

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}#block-${blockId}`
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard")
        }).catch(() => {
            toast.error("Failed to copy link")
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children || (
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {/* Turn Into submenu */}
                {availableConversions.length > 0 && (
                    <>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Type className="mr-2 h-4 w-4" />
                                Turn into
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {availableConversions.map((type) => (
                                    <DropdownMenuItem
                                        key={type}
                                        onClick={() => onConvert(type)}
                                    >
                                        {BLOCK_TYPE_ICONS[type] || <Type className="h-4 w-4" />}
                                        <span className="ml-2">{formatBlockTypeName(type)}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* Color submenu */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Palette className="mr-2 h-4 w-4" />
                        Color
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                        <div className="grid grid-cols-2 gap-1 p-2">
                            {Object.entries(colors).map(([colorKey, colorValue]) => (
                                <button
                                    key={colorKey}
                                    onClick={() => onColorChange(colorKey as BlockColor)}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors",
                                        backgroundColor === colorKey && "bg-muted"
                                    )}
                                >
                                    <div
                                        className="w-4 h-4 rounded border border-border"
                                        style={{ backgroundColor: colorValue.bg }}
                                    />
                                    <span className="text-xs">{colorValue.label}</span>
                                </button>
                            ))}
                        </div>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Duplicate */}
                <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                </DropdownMenuItem>

                {/* Copy link to block */}
                <DropdownMenuItem onClick={handleCopyLink}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy link to block
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Delete */}
                <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
