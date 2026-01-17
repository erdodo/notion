export const embedPatterns = {
    youtube: [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
        /youtu\.be\/([a-zA-Z0-9_-]+)/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    ],
    vimeo: [
        /vimeo\.com\/(\d+)/,
    ],
    twitter: [
        /twitter\.com\/\w+\/status\/(\d+)/,
        /x\.com\/\w+\/status\/(\d+)/,
    ],
    figma: [
        /figma\.com\/(file|proto)\/([a-zA-Z0-9]+)/,
    ],
    codepen: [
        /codepen\.io\/(\w+)\/pen\/(\w+)/,
    ],
    codesandbox: [
        /codesandbox\.io\/s\/([a-zA-Z0-9-]+)/,
    ],
    loom: [
        /loom\.com\/share\/([a-zA-Z0-9]+)/,
    ],
    spotify: [
        /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/,
    ],
};

export const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // YouTube
    for (const pattern of embedPatterns.youtube) {
        const match = url.match(pattern);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }

    // Vimeo
    for (const pattern of embedPatterns.vimeo) {
        const match = url.match(pattern);
        if (match) {
            return `https://player.vimeo.com/video/${match[1]}`;
        }
    }

    // Twitter/X - difficult to embed directly without API or widgets script, 
    // but we can try to use a 3rd party or just return null for now if we want "Universal Embed" handling later.
    // Actually standard BlockNote or typical implementations might use publish.twitter.com or similar.
    // For this util, let's focus on iframe-able content.

    // Figma
    for (const pattern of embedPatterns.figma) {
        if (pattern.test(url)) {
            return `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(url)}`;
        }
    }

    // CodePen
    for (const pattern of embedPatterns.codepen) {
        const match = url.match(pattern);
        if (match) {
            // url usually: codepen.io/user/pen/slug
            // embed: codepen.io/user/embed/slug
            return url.replace('/pen/', '/embed/');
        }
    }

    // CodeSandbox
    for (const pattern of embedPatterns.codesandbox) {
        if (pattern.test(url)) {
            return url.replace('/s/', '/embed/');
        }
    }

    // Loom
    for (const pattern of embedPatterns.loom) {
        const match = url.match(pattern);
        if (match) {
            return `https://www.loom.com/embed/${match[1]}`;
        }
    }

    // Spotify
    for (const pattern of embedPatterns.spotify) {
        if (pattern.test(url)) {
            // Spotify embed urls are usually open.spotify.com/embed/...
            // We can just inject /embed/ after open.spotify.com/
            return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
        }
    }

    return null;
}

export const isEmbeddable = (url: string): boolean => {
    return !!getEmbedUrl(url);
}

// For video block specifically, we might want to check if it represents a video service
export const isVideoUrl = (url: string): boolean => {
    return embedPatterns.youtube.some(p => p.test(url)) || embedPatterns.vimeo.some(p => p.test(url));
}
