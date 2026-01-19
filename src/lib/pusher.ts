import PusherServer from "pusher"


// Server-side Pusher instance
const pusherConfig = {
    appId: process.env.PUSHER_APP_ID || "app-id",
    key: process.env.PUSHER_KEY || "key",
    secret: process.env.PUSHER_SECRET || "secret",
    cluster: process.env.PUSHER_CLUSTER || "cluster",
    useTLS: true,
}

const realPusher = new PusherServer(pusherConfig)

export const pusherServer = {
    trigger: async (channel: string, event: string, data: any) => {
        if (process.env.TEST_MODE === "true") {
            console.log(`[Pusher Mock] Triggered ${event} on ${channel}`);
            return;
        }
        return realPusher.trigger(channel, event, data);
    },
    authorizeChannel: (socketId: string, channel: string, presenceData?: any) => {
        if (process.env.TEST_MODE === "true") {
            return { auth: "mock-auth", channel_data: JSON.stringify(presenceData || {}) };
        }
        return realPusher.authorizeChannel(socketId, channel, presenceData);
    }
}


