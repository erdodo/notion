"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { searchUsers } from "@/app/(main)/_actions/users"
import { useDebounce } from "use-debounce"
import type { User } from "@prisma/client"

interface UserMentionInputProps {
    value: string
    onChange: (value: string) => void
    onMentionsChange?: (userIds: string[]) => void
    placeholder?: string
    className?: string
}

export function UserMentionInput({
    value,
    onChange,
    onMentionsChange,
    placeholder,
    className
}: UserMentionInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [showMentions, setShowMentions] = useState(false)
    const [mentionQuery, setMentionQuery] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [mentionedUsers, setMentionedUsers] = useState<string[]>([])

    const [debouncedQuery] = useDebounce(mentionQuery, 200)

    // Kullanıcıları ara
    useEffect(() => {
        if (debouncedQuery) {
            searchUsers(debouncedQuery).then(setUsers)
        } else {
            setUsers([])
        }
    }, [debouncedQuery])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        onChange(newValue)

        // @ karakteri kontrolü
        const cursorPos = e.target.selectionStart
        const textBeforeCursor = newValue.slice(0, cursorPos)
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

        if (mentionMatch) {
            setMentionQuery(mentionMatch[1])
            setShowMentions(true)
        } else {
            setShowMentions(false)
            setMentionQuery("")
        }
    }

    const insertMention = (user: User) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const cursorPos = textarea.selectionStart
        const textBeforeCursor = value.slice(0, cursorPos)
        const textAfterCursor = value.slice(cursorPos)

        // @query kısmını @username ile değiştir
        const mentionStart = textBeforeCursor.lastIndexOf('@')
        const newText =
            textBeforeCursor.slice(0, mentionStart) +
            `@${user.name} ` +
            textAfterCursor

        onChange(newText)
        setShowMentions(false)
        setMentionQuery("")

        // Mentioned users'ı güncelle
        const newMentioned = [...mentionedUsers, user.id]
        setMentionedUsers(newMentioned)
        onMentionsChange?.(newMentioned)

        // Focus'u geri al
        textarea.focus()
    }

    return (
        <div className={className}>
            <Popover open={showMentions} onOpenChange={setShowMentions}>
                <PopoverAnchor asChild>
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleInput}
                        placeholder={placeholder}
                        className="min-h-[80px] resize-none"
                    />
                </PopoverAnchor>

                <PopoverContent
                    className="w-64 p-0"
                    align="start"
                    side="top"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <Command>
                        <CommandList>
                            <CommandEmpty>No users found</CommandEmpty>
                            {users.map(user => (
                                <CommandItem
                                    key={user.id}
                                    onSelect={() => insertMention(user)}
                                    className="flex items-center gap-2"
                                >
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={user.image || undefined} />
                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
