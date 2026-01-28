import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { PageSkeleton } from '@/components/page-skeleton';

describe('PageSkeleton', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<PageSkeleton />);

    const elements = container.querySelectorAll('[class*="h-"]');
    expect(elements.length).toBeGreaterThan(0);
    
    const hasAnimatePulse = container.querySelector('.animate-pulse');
    expect(hasAnimatePulse).toBeInTheDocument();
  });
});
