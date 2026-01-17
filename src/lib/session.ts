import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  return user
}
