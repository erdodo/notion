"use server"

export async function fetchLinkMetadata(url: string) {
    if (!url) return null

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "bot-fetch-link-metadata",
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            throw new Error("Failed to fetch URL")
        }

        const html = await response.text()

        // Simple regex to extract meta tags
        const getMetaTag = (name: string) => {
            const match = html.match(new RegExp(`<meta property="${name}" content="(.*?)"`, "i")) ||
                html.match(new RegExp(`<meta name="${name}" content="(.*?)"`, "i"))
            return match ? match[1] : undefined
        }

        const title = getMetaTag("og:title") ||
            getMetaTag("twitter:title") ||
            html.match(/<title>(.*?)<\/title>/)?.[1] ||
            url

        const description = getMetaTag("og:description") ||
            getMetaTag("twitter:description") ||
            getMetaTag("description")

        const image = getMetaTag("og:image") ||
            getMetaTag("twitter:image")

        const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`

        return {
            title,
            description,
            image,
            favicon: favicon,
            url
        }
    } catch (error) {
        console.error("Error fetching link metadata:", error)
        return null
    }
}
