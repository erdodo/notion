import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/documents")
  }

  // Redirect unauthenticated users to sign-in page
  redirect("/sign-in")
}
