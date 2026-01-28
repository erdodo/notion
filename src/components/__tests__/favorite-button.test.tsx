import { describe, it, expect } from 'vitest';
import { FavoriteButton } from '../favorite-button';

describe('FavoriteButton', () => {
  it('should be defined', () => {
    expect(FavoriteButton).toBeDefined();
  });

  it('should be a function component', () => {
    expect(typeof FavoriteButton).toBe('function');
  });
});
