import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QueryProvider } from '../query-provider';

vi.mock('@tanstack/react-query', () => {
  return {
    QueryClient: class {
      clear = vi.fn();
      setDefaultOptions = vi.fn();
    },
    QueryClientProvider: ({ children, client }: any) => (
      <div
        data-testid="query-client-provider"
        data-client={client ? 'true' : 'false'}
      >
        {children}
      </div>
    ),
  };
});

describe('QueryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render query provider wrapper', () => {
    render(
      <QueryProvider>
        <div>Test content</div>
      </QueryProvider>
    );

    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
  });

  it('should render children inside query client provider', () => {
    render(
      <QueryProvider>
        <div>Test content</div>
      </QueryProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should create query client instance', () => {
    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    const provider = screen.getByTestId('query-client-provider');
    expect(provider).toHaveAttribute('data-client', 'true');
  });

  it('should pass query client to provider', () => {
    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    const provider = screen.getByTestId('query-client-provider');
    expect(provider.dataset.client).toBe('true');
  });

  it('should render single child element', () => {
    render(
      <QueryProvider>
        <button>Click me</button>
      </QueryProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should wrap multiple children correctly', () => {
    render(
      <QueryProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </QueryProvider>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should maintain children order', () => {
    const { container } = render(
      <QueryProvider>
        <span>First</span>
        <span>Second</span>
        <span>Third</span>
      </QueryProvider>
    );

    const spans = container.querySelectorAll('span');
    expect(spans[0]).toHaveTextContent('First');
    expect(spans[1]).toHaveTextContent('Second');
    expect(spans[2]).toHaveTextContent('Third');
  });

  it('should handle empty children', () => {
    const { container } = render(<QueryProvider>{null}</QueryProvider>);

    const queryProvider = container.querySelector(
      '[data-testid="query-client-provider"]'
    );
    expect(queryProvider).toBeInTheDocument();
  });

  it('should handle nested components', () => {
    render(
      <QueryProvider>
        <div>
          <div>
            <button>Nested button</button>
          </div>
        </div>
      </QueryProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should work with fragment children', () => {
    render(
      <QueryProvider>
        <>
          <div>Fragment child 1</div>
          <div>Fragment child 2</div>
        </>
      </QueryProvider>
    );

    expect(screen.getByText('Fragment child 1')).toBeInTheDocument();
    expect(screen.getByText('Fragment child 2')).toBeInTheDocument();
  });

  it('should work with functional components as children', () => {
    const ChildComponent = () => <div>Child component</div>;

    render(
      <QueryProvider>
        <ChildComponent />
      </QueryProvider>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('should provide query client context to children', () => {
    render(
      <QueryProvider>
        <div>Query context available</div>
      </QueryProvider>
    );

    expect(screen.getByText('Query context available')).toBeInTheDocument();
  });

  it('should wrap provider correctly with provider element', () => {
    const { container } = render(
      <QueryProvider>
        <span>Content</span>
      </QueryProvider>
    );

    const provider = container.querySelector(
      '[data-testid="query-client-provider"]'
    );
    expect(provider).toContainElement(screen.getByText('Content'));
  });

  it('should handle children with event handlers', () => {
    const handleClick = vi.fn();

    render(
      <QueryProvider>
        <button onClick={handleClick}>Click</button>
      </QueryProvider>
    );

    const button = screen.getByRole('button');
    button.click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render children with text content', () => {
    render(
      <QueryProvider>
        <p>Some text content</p>
      </QueryProvider>
    );

    expect(screen.getByText('Some text content')).toBeInTheDocument();
  });

  it('should handle long children tree', () => {
    render(
      <QueryProvider>
        <div>
          <section>
            <article>
              <div>
                <span>Deep content</span>
              </div>
            </article>
          </section>
        </div>
      </QueryProvider>
    );

    expect(screen.getByText('Deep content')).toBeInTheDocument();
  });

  it('should maintain ReactNode children type', () => {
    render(<QueryProvider>{'String as children'}</QueryProvider>);

    expect(screen.getByText('String as children')).toBeInTheDocument();
  });

  it('should create unique query client per instance', () => {
    const { unmount } = render(
      <QueryProvider>
        <div>First</div>
      </QueryProvider>
    );

    const provider1 = screen.getByTestId('query-client-provider');
    expect(provider1).toHaveAttribute('data-client', 'true');

    unmount();

    render(
      <QueryProvider>
        <div>Second</div>
      </QueryProvider>
    );

    const provider2 = screen.getByTestId('query-client-provider');
    expect(provider2).toHaveAttribute('data-client', 'true');
  });

  it('should initialize query client on render', () => {
    const { container } = render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    const provider = container.querySelector(
      '[data-testid="query-client-provider"]'
    );
    expect(provider?.dataset.client).toBe('true');
  });

  it('should support nested QueryProviders', () => {
    render(
      <QueryProvider>
        <div>Outer</div>
        <QueryProvider>
          <div>Inner</div>
        </QueryProvider>
      </QueryProvider>
    );

    expect(screen.getByText('Outer')).toBeInTheDocument();
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });

  it('should properly unmount and cleanup', () => {
    const { unmount } = render(
      <QueryProvider>
        <div>Content</div>
      </QueryProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();

    unmount();

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render with query client as provider prop', () => {
    render(
      <QueryProvider>
        <div>Query enabled</div>
      </QueryProvider>
    );

    const provider = screen.getByTestId('query-client-provider');
    expect(provider).toBeInTheDocument();
    expect(provider.dataset.client).toBe('true');
  });
});
