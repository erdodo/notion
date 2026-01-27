import { render, screen } from '@testing-library/react';

import { Item } from '../item';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

describe('Item Component', () => {
  it('does NOT render plus button when onCreate is undefined', () => {
    render(<Item id="1" title="Test Item" />);

    screen.getAllByRole('button');

    screen.queryByTestId('plus-icon');

    const sideButtons = screen
      .queryAllByRole('button')
      .filter((button) =>
        button.className.includes('opacity-0 group-hover:opacity-100')
      );
    expect(sideButtons).toHaveLength(1);
  });

  it('renders plus button when onCreate is provided', () => {
    render(<Item id="1" title="Test Item" onCreate={() => {}} />);
    const sideButtons = screen
      .queryAllByRole('button')
      .filter((button) =>
        button.className.includes('opacity-0 group-hover:opacity-100')
      );
    expect(sideButtons).toHaveLength(2);
  });
});
