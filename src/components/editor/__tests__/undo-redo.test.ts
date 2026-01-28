import { describe, it, expect } from 'vitest';
import StarterKit from '@tiptap/starter-kit';

describe('Undo/Redo Functionality', () => {  
  it('should have StarterKit with History', () => {
    expect(StarterKit).toBeDefined();
    expect(StarterKit.name).toBe('starterKit');
  });

  it('should configure history in StarterKit', () => {
    const configured = StarterKit.configure({
      history: {
        depth: 100,
      },
    });
    expect(configured).toBeDefined();
  });
});
