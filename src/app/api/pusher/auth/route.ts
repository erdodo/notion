import { auth } from "@/lib/auth"
import { pusherServer } from "@/lib/pusher"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.formData()
    const socketId = body.get("socket_id") as string
    const channel = body.get("channel_name") as string

    if (!socketId || !channel) {
        return new NextResponse("Missing socket_id or channel_name", { status: 400 })
    }

    // Generate a random color for the user if not present (handled on client usually, but could be consistent here)
    // For now, we trust client or generate consistently?
    // Let's pass basic user info.
    const presenceData = {
        user_id: session.user.email,
        user_info: {
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
        },
    }

    try {
        const authResponse = pusherServer.authorizeChannel(socketId, channel, presenceData)
        return NextResponse.json(authResponse)
    } catch (error) {
        console.error("Pusher auth error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
