import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { FileText } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <FileText className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-medium">Welcome to your workspace</h2>
      <p className="text-muted-foreground">
        Create a new page to get started
      </p>
    </div>
  )
}
