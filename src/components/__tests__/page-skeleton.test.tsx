import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { PageSkeleton } from '@/components/page-skeleton';

describe('PageSkeleton', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<PageSkeleton />);

    expect(container.querySelectorAll('.h-[35vh].w-full')).toHaveLength(1);
    expect(container.querySelectorAll('.h-16.w-16')).toHaveLength(1);
    expect(container.querySelectorAll('.h-12.w-full')).toHaveLength(1);
  });
});
