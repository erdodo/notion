import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ThemeProvider } from '../theme-provider';

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...properties }: any) => (
    <div
      data-testid="next-themes-provider"
      data-props={JSON.stringify(properties)}
    >
      {children}
    </div>
  ),
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render theme provider wrapper', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
  });

  it('should render children inside theme provider', () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should accept attribute prop', () => {
    render(
      <ThemeProvider attribute="class">
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    expect(provider).toBeInTheDocument();
  });

  it('should pass attribute prop to next themes provider', () => {
    render(
      <ThemeProvider attribute="class">
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.attribute).toBe('class');
  });

  it('should accept defaultTheme prop', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.defaultTheme).toBe('dark');
  });

  it('should accept storageKey prop', () => {
    render(
      <ThemeProvider storageKey="app-theme">
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.storageKey).toBe('app-theme');
  });

  it('should accept multiple props', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" storageKey="theme">
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.attribute).toBe('class');
    expect(properties.defaultTheme).toBe('light');
    expect(properties.storageKey).toBe('theme');
  });

  it('should render single child element', () => {
    render(
      <ThemeProvider>
        <button>Click me</button>
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should wrap multiple children correctly', () => {
    render(
      <ThemeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should maintain children order', () => {
    const { container } = render(
      <ThemeProvider>
        <span>First</span>
        <span>Second</span>
        <span>Third</span>
      </ThemeProvider>
    );

    const spans = container.querySelectorAll('span');
    expect(spans[0]).toHaveTextContent('First');
    expect(spans[1]).toHaveTextContent('Second');
    expect(spans[2]).toHaveTextContent('Third');
  });

  it('should handle empty children', () => {
    const { container } = render(<ThemeProvider>{null}</ThemeProvider>);

    const themeProvider = container.querySelector(
      '[data-testid="next-themes-provider"]'
    );
    expect(themeProvider).toBeInTheDocument();
  });

  it('should handle nested components', () => {
    render(
      <ThemeProvider>
        <div>
          <div>
            <button>Nested button</button>
          </div>
        </div>
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should work with fragment children', () => {
    render(
      <ThemeProvider>
        <>
          <div>Fragment child 1</div>
          <div>Fragment child 2</div>
        </>
      </ThemeProvider>
    );

    expect(screen.getByText('Fragment child 1')).toBeInTheDocument();
    expect(screen.getByText('Fragment child 2')).toBeInTheDocument();
  });

  it('should work with functional components as children', () => {
    const ChildComponent = () => <div>Child component</div>;

    render(
      <ThemeProvider>
        <ChildComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('should provide theme context to children', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <div>Theme context available</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Theme context available')).toBeInTheDocument();
  });

  it('should wrap provider correctly with provider element', () => {
    const { container } = render(
      <ThemeProvider>
        <span>Content</span>
      </ThemeProvider>
    );

    const provider = container.querySelector(
      '[data-testid="next-themes-provider"]'
    );
    expect(provider).toContainElement(screen.getByText('Content'));
  });

  it('should handle children with event handlers', () => {
    const handleClick = vi.fn();

    render(
      <ThemeProvider>
        <button onClick={handleClick}>Click</button>
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    button.click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render children with text content', () => {
    render(
      <ThemeProvider>
        <p>Some text content</p>
      </ThemeProvider>
    );

    expect(screen.getByText('Some text content')).toBeInTheDocument();
  });

  it('should handle long children tree', () => {
    render(
      <ThemeProvider>
        <div>
          <section>
            <article>
              <div>
                <span>Deep content</span>
              </div>
            </article>
          </section>
        </div>
      </ThemeProvider>
    );

    expect(screen.getByText('Deep content')).toBeInTheDocument();
  });

  it('should maintain ReactNode children type', () => {
    render(<ThemeProvider>{'String as children'}</ThemeProvider>);

    expect(screen.getByText('String as children')).toBeInTheDocument();
  });

  it('should accept enableColorScheme prop', () => {
    render(
      <ThemeProvider enableColorScheme={false}>
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.enableColorScheme).toBe(false);
  });

  it('should accept themes array prop', () => {
    render(
      <ThemeProvider themes={['light', 'dark', 'auto']}>
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(Array.isArray(properties.themes)).toBe(true);
  });

  it('should handle disableTransitionOnChange prop', () => {
    render(
      <ThemeProvider disableTransitionOnChange={true}>
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.disableTransitionOnChange).toBe(true);
  });

  it('should spread all props to next themes provider', () => {
    render(
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        storageKey="my-theme"
        enableSystem={true}
      >
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.attribute).toBe('class');
    expect(properties.defaultTheme).toBe('dark');
    expect(properties.storageKey).toBe('my-theme');
    expect(properties.enableSystem).toBe(true);
  });

  it('should properly unmount and cleanup', () => {
    const { unmount } = render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();

    unmount();

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render with next-themes provider', () => {
    render(
      <ThemeProvider>
        <div>Theme enabled</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    expect(provider).toBeInTheDocument();
  });

  it('should support enableSystem option', () => {
    render(
      <ThemeProvider enableSystem={true}>
        <div>System theme enabled</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.enableSystem).toBe(true);
  });

  it('should pass forcedTheme prop correctly', () => {
    render(
      <ThemeProvider forcedTheme="dark">
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const properties = JSON.parse(provider.dataset.props || '{}');
    expect(properties.forcedTheme).toBe('dark');
  });
});
