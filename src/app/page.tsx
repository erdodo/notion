import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { SignIn } from "@clerk/nextjs"

export default function HomePage() {
  const { userId } = auth()

  if (userId) {
    redirect("/documents")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Notion Clone</h1>
        <p className="text-muted-foreground">Sign in to get started</p>
        <SignIn />
      </div>
    </div>
  )
}
