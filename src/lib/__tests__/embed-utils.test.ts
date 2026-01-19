import { describe, it, expect } from 'vitest'
import { embedPatterns, getEmbedUrl, isEmbeddable, isVideoUrl } from '../embed-utils'

describe('embed-utils', () => {
  describe('embedPatterns', () => {
    it('should have youtube patterns', () => {
      expect(embedPatterns.youtube).toBeDefined()
      expect(Array.isArray(embedPatterns.youtube)).toBe(true)
      expect(embedPatterns.youtube.length).toBeGreaterThan(0)
    })

    it('should have vimeo patterns', () => {
      expect(embedPatterns.vimeo).toBeDefined()
      expect(Array.isArray(embedPatterns.vimeo)).toBe(true)
    })

    it('should have all required providers', () => {
      const providers = ['youtube', 'vimeo', 'twitter', 'figma', 'codepen', 'codesandbox', 'loom', 'spotify']
      providers.forEach(provider => {
        expect(embedPatterns).toHaveProperty(provider)
      })
    })
  })

  describe('getEmbedUrl', () => {
    it('should return null for empty string', () => {
      expect(getEmbedUrl('')).toBeNull()
    })

    it('should return null for non-URL string', () => {
      expect(getEmbedUrl('not a url')).toBeNull()
    })

    it('should convert youtube.com watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      const result = getEmbedUrl(url)
      expect(result).toContain('youtube.com/embed/dQw4w9WgXcQ')
    })

    it('should convert youtu.be short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      const result = getEmbedUrl(url)
      expect(result).toContain('youtube.com/embed/dQw4w9WgXcQ')
    })

    it('should convert youtube.com/embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      const result = getEmbedUrl(url)
      expect(result).toContain('dQw4w9WgXcQ')
    })

    it('should convert vimeo URL', () => {
      const url = 'https://vimeo.com/123456789'
      const result = getEmbedUrl(url)
      expect(result).toContain('player.vimeo.com/video/123456789')
    })

    it('should handle figma URLs', () => {
      const url = 'https://www.figma.com/file/abc123/my-design'
      const result = getEmbedUrl(url)
      expect(result).toBeDefined()
      expect(result).toContain('figma.com')
    })

    it('should convert codepen URL', () => {
      const url = 'https://codepen.io/user/pen/abc123'
      const result = getEmbedUrl(url)
      expect(result).toContain('codepen.io')
      expect(result).toContain('embed')
    })

    it('should convert codesandbox URL', () => {
      const url = 'https://codesandbox.io/s/my-project-abc123'
      const result = getEmbedUrl(url)
      expect(result).toContain('codesandbox.io')
      expect(result).toContain('embed')
    })

    it('should convert loom URL', () => {
      const url = 'https://www.loom.com/share/abc123def456'
      const result = getEmbedUrl(url)
      expect(result).toContain('loom.com/embed/abc123def456')
    })

    it('should convert spotify track URL', () => {
      const url = 'https://open.spotify.com/track/abc123'
      const result = getEmbedUrl(url)
      expect(result).toContain('spotify.com/embed')
    })

    it('should handle spotify album URL', () => {
      const url = 'https://open.spotify.com/album/abc123'
      const result = getEmbedUrl(url)
      expect(result).toBeDefined()
      expect(result).toContain('spotify.com')
    })

    it('should handle spotify playlist URL', () => {
      const url = 'https://open.spotify.com/playlist/abc123'
      const result = getEmbedUrl(url)
      expect(result).toBeDefined()
    })
  })

  describe('isEmbeddable', () => {
    it('should return true for youtube URL', () => {
      expect(isEmbeddable('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
    })

    it('should return true for vimeo URL', () => {
      expect(isEmbeddable('https://vimeo.com/123456789')).toBe(true)
    })

    it('should return true for codepen URL', () => {
      expect(isEmbeddable('https://codepen.io/user/pen/abc123')).toBe(true)
    })

    it('should return true for loom URL', () => {
      expect(isEmbeddable('https://www.loom.com/share/abc123')).toBe(true)
    })

    it('should return false for non-embeddable URL', () => {
      expect(isEmbeddable('https://example.com')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isEmbeddable('')).toBe(false)
    })

    it('should return false for plain text', () => {
      expect(isEmbeddable('just some text')).toBe(false)
    })
  })

  describe('isVideoUrl', () => {
    it('should return true for youtube URL', () => {
      expect(isVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
    })

    it('should return true for youtu.be URL', () => {
      expect(isVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    })

    it('should return true for vimeo URL', () => {
      expect(isVideoUrl('https://vimeo.com/123456789')).toBe(true)
    })

    it('should return false for non-video service', () => {
      expect(isVideoUrl('https://codepen.io/user/pen/abc123')).toBe(false)
    })

    it('should return false for spotify URL', () => {
      expect(isVideoUrl('https://open.spotify.com/track/abc123')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isVideoUrl('')).toBe(false)
    })

    it('should return false for random URL', () => {
      expect(isVideoUrl('https://example.com')).toBe(false)
    })
  })
})
