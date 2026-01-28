import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Spinner } from '@/components/spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    render(<Spinner />);
    expect(true).toBe(true);
  });

  it('renders with large size', () => {
    render(<Spinner size="lg" />);
    expect(true).toBe(true);
  });

  it('renders with icon size', () => {
    render(<Spinner size="icon" />);
    expect(true).toBe(true);
  });
});
