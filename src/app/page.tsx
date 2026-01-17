import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    redirect("/documents")
  }

  // Redirect unauthenticated users to sign-in page
  redirect("/sign-in")
}
