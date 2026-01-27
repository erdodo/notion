export const embedPatterns = {
  youtube: [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ],
  vimeo: [/vimeo\.com\/(\d+)/],
  twitter: [/twitter\.com\/\w+\/status\/(\d+)/, /x\.com\/\w+\/status\/(\d+)/],
  figma: [/figma\.com\/(file|proto)\/([a-zA-Z0-9]+)/],
  codepen: [/codepen\.io\/(\w+)\/pen\/(\w+)/],
  codesandbox: [/codesandbox\.io\/s\/([a-zA-Z0-9-]+)/],
  loom: [/loom\.com\/share\/([a-zA-Z0-9]+)/],
  spotify: [/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/],
};

export const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  for (const pattern of embedPatterns.youtube) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  for (const pattern of embedPatterns.vimeo) {
    const match = url.match(pattern);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  }

  for (const pattern of embedPatterns.figma) {
    if (pattern.test(url)) {
      return `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(url)}`;
    }
  }

  for (const pattern of embedPatterns.codepen) {
    const match = url.match(pattern);
    if (match) {
      return url.replace('/pen/', '/embed/');
    }
  }

  for (const pattern of embedPatterns.codesandbox) {
    if (pattern.test(url)) {
      return url.replace('/s/', '/embed/');
    }
  }

  for (const pattern of embedPatterns.loom) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.loom.com/embed/${match[1]}`;
    }
  }

  for (const pattern of embedPatterns.spotify) {
    if (pattern.test(url)) {
      return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
  }

  return null;
};

export const isEmbeddable = (url: string): boolean => {
  return !!getEmbedUrl(url);
};

export const isVideoUrl = (url: string): boolean => {
  return (
    embedPatterns.youtube.some((p) => p.test(url)) ||
    embedPatterns.vimeo.some((p) => p.test(url))
  );
};
