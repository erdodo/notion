import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skeleton element', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render as div element', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.tagName).toBe('DIV');
  });

  it('should have rounded styling', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('rounded-md');
  });

  it('should have background color', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toMatch(/bg-/);
  });

  it('should have muted background', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('bg-gray-200');
  });

  it('should have animation', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('animate-pulse');
  });

  it('should render default size', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');
    expect(skeleton).toBeInTheDocument();
  });

  it('should support custom height', () => {
    const { container } = render(<Skeleton className="h-12" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-12');
  });

  it('should support custom width', () => {
    const { container } = render(<Skeleton className="w-12" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('w-12');
  });

  it('should support custom square size', () => {
    const { container } = render(
      <Skeleton className="h-12 w-12 rounded-full" />
    );
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-12');
    expect(skeleton?.className).toContain('w-12');
    expect(skeleton?.className).toContain('rounded-full');
  });

  it('should render text skeleton', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-4');
    expect(skeleton?.className).toContain('w-full');
  });

  it('should render text skeleton with partial width', () => {
    const { container } = render(<Skeleton className="h-4 w-1/2" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('w-1/2');
  });

  it('should render avatar skeleton', () => {
    const { container } = render(
      <Skeleton className="h-12 w-12 rounded-full" />
    );
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-12');
    expect(skeleton?.className).toContain('w-12');
    expect(skeleton?.className).toContain('rounded-full');
  });

  it('should render button skeleton', () => {
    const { container } = render(<Skeleton className="h-10 w-24 rounded-md" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-10');
    expect(skeleton?.className).toContain('w-24');
    expect(skeleton?.className).toContain('rounded-md');
  });

  it('should render card skeleton layout', () => {
    const { container } = render(
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
    const skeletons = container.querySelectorAll('div > div');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('should render list skeleton items', () => {
    render(
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" data-testid="item-1" />
        <Skeleton className="h-4 w-full" data-testid="item-2" />
        <Skeleton className="h-4 w-full" data-testid="item-3" />
      </div>
    );
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
  });

  it('should support className prop', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('custom-skeleton');
  });

  it('should support data attributes', () => {
    render(<Skeleton data-testid="custom-skeleton" />);
    expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument();
  });

  it('should support aria-label', () => {
    render(<Skeleton aria-label="loading" />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('should support aria-busy', () => {
    render(<Skeleton aria-busy="true" />);
  });

  it('should have pulse animation', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('animate-pulse');
  });

  it('should support disabling animation via className', () => {
    const { container } = render(<Skeleton className="animate-none" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('animate-none');
  });

  it('should support full rounded', () => {
    const { container } = render(<Skeleton className="rounded-full" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('rounded-full');
  });

  it('should support no rounded', () => {
    const { container } = render(<Skeleton className="rounded-none" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('rounded-none');
  });

  it('should support custom rounded', () => {
    const { container } = render(<Skeleton className="rounded-lg" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('rounded-lg');
  });

  it('should render multiple skeletons', () => {
    render(
      <>
        <Skeleton data-testid="skeleton-1" />
        <Skeleton data-testid="skeleton-2" />
        <Skeleton data-testid="skeleton-3" />
      </>
    );
    expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
  });

  it('should support gap in skeleton container', () => {
    const { container } = render(
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12" />
        <Skeleton className="h-12 flex-1" />
      </div>
    );
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('gap-4');
  });

  it('should support aspect-square for circular skeleton', () => {
    const { container } = render(
      <Skeleton className="h-12 w-12 rounded-full aspect-square" />
    );
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('aspect-square');
  });

  it('should render header skeleton', () => {
    const { container } = render(
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
    const skeletons = container.querySelectorAll('div > div');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('should render input skeleton', () => {
    const { container } = render(
      <Skeleton className="h-10 w-full rounded-md" />
    );
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-10');
    expect(skeleton?.className).toContain('w-full');
  });

  it('should combine multiple classes', () => {
    const { container } = render(
      <Skeleton className="h-12 w-12 rounded-full" />
    );
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-12');
    expect(skeleton?.className).toContain('w-12');
    expect(skeleton?.className).toContain('rounded-full');
  });

  it('should combine with spacing classes', () => {
    const { container } = render(<Skeleton className="h-4 w-full mb-4" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('mb-4');
  });

  it('should render table cell skeleton', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <td>
              <Skeleton className="h-4 w-full" />
            </td>
          </tr>
        </tbody>
      </table>
    );
    expect(container.querySelector('td > div')).toBeInTheDocument();
  });

  it('should render nested skeleton structure', () => {
    const { container } = render(
      <div className="space-y-4 p-4 border rounded">
        <Skeleton className="h-6 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThan(1);
  });

  it('should work as loading state indicator', () => {
    const { container } = render(
      <div>
        <Skeleton className="h-4 w-full" aria-label="loading content" />
      </div>
    );
    expect(container.querySelector('div > div')).toBeInTheDocument();
  });

  it('should have semantic role', () => {
    render(<Skeleton role="status" aria-label="content loading" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should support aria-hidden', () => {
    render(<Skeleton aria-hidden="true" data-testid="hidden-skeleton" />);
    const skeleton = screen.getByTestId('hidden-skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('should support flex growth', () => {
    const { container } = render(
      <div className="flex">
        <Skeleton className="w-12 h-12" />
        <Skeleton className="flex-1 h-12" />
      </div>
    );
    const skeletons = container.querySelectorAll('div > div');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('should support grid layout', () => {
    const { container } = render(
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
    const skeletons = container.querySelectorAll('div.grid > div');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('should render without className', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render with only height', () => {
    const { container } = render(<Skeleton className="h-4" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('h-4');
  });

  it('should render with only width', () => {
    const { container } = render(<Skeleton className="w-24" />);
    const skeleton = container.querySelector('div');
    expect(skeleton?.className).toContain('w-24');
  });

  it('should forward ref to div element', () => {
    let reference: HTMLDivElement | null = null;
    render(<Skeleton ref={(element) => (reference = element)} />);
    expect(reference).toBeInstanceOf(HTMLDivElement);
  });

  it('should render comment skeleton', () => {
    const { container } = render(
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThan(1);
  });

  it('should render product card skeleton', () => {
    const { container } = render(
      <div className="space-y-4 p-4 border rounded">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThan(1);
  });

  it('should render post skeleton', () => {
    const { container } = render(
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThan(1);
  });
});
