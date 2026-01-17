"use client"

export const ItemSkeleton = ({ level = 0 }: { level?: number }) => {
  return (
    <div
      className="flex items-center gap-x-2 py-1"
      style={{
        paddingLeft: level > 0 ? `${(level * 12) + 12}px` : "12px"
      }}
    >
      <div className="h-4 w-4 rounded-sm bg-muted animate-pulse" />
      <div className="h-4 flex-1 rounded-sm bg-muted animate-pulse" />
    </div>
  )
}
