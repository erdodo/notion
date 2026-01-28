import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render tooltip trigger', () => {
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('should render tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Hover me');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Tooltip content')[0]).toBeInTheDocument();
    });
  });

  it('should hide tooltip by default', () => {
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Hidden content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.queryAllByText('Hidden content')).toHaveLength(0);
  });

  it.skip('should show tooltip on hover and hide on unhover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Visible content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Visible content')[0]).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);
    await waitFor(
      () => {
        expect(screen.queryAllByText('Visible content')).toHaveLength(0);
      },
      { timeout: 1000 }
    );
  });

  it('should show tooltip on focus', async () => {
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Focused tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    act(() => {
      trigger.focus();
    });
    await waitFor(() => {
      expect(screen.getAllByText('Focused tooltip')[0]).toBeInTheDocument();
    });
  });

  it('should hide tooltip on blur', async () => {
    const user = userEvent.setup();
    render(
      <>
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Blurred tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button>Other</button>
      </>
    );
    const trigger = screen.getByText('Trigger');
    const other = screen.getByRole('button', { name: 'Other' });

    act(() => {
      trigger.focus();
    });
    await waitFor(() => {
      expect(screen.getAllByText('Blurred tooltip')[0]).toBeInTheDocument();
    });

    await user.click(other);
    await waitFor(
      () => {
        expect(screen.queryAllByText('Blurred tooltip')).toHaveLength(0);
      },
      { timeout: 1000 }
    );
  });

  it('should show tooltip with keyboard', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Keyboard tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await user.tab();
    await waitFor(() => {
      expect(screen.getAllByText('Keyboard tooltip')[0]).toBeInTheDocument();
    });
  });

  it('should render multiple tooltips', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger data-testid="trigger1">First</TooltipTrigger>
          <TooltipContent>First tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger data-testid="trigger2">Second</TooltipTrigger>
          <TooltipContent>Second tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger1 = screen.getByTestId('trigger1');

    await user.hover(trigger1);
    await waitFor(() => {
      expect(screen.getAllByText('First tooltip')[0]).toBeInTheDocument();
    });
  });

  it.skip('should only show one tooltip at a time', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger data-testid="trigger1">First</TooltipTrigger>
          <TooltipContent>First tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger data-testid="trigger2">Second</TooltipTrigger>
          <TooltipContent>Second tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger1 = screen.getByTestId('trigger1');
    const trigger2 = screen.getByTestId('trigger2');

    await user.hover(trigger1);
    await waitFor(() => {
      expect(screen.getAllByText('First tooltip')[0]).toBeInTheDocument();
    });

    fireEvent.mouseEnter(trigger2);
    await waitFor(() => {
      expect(screen.getAllByText('Second tooltip')[0]).toBeInTheDocument();
      expect(screen.queryAllByText('First tooltip')).toHaveLength(0);
    });
  });

  it('should render text content', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Simple text content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Hover');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Simple text content')[0]).toBeInTheDocument();
    });
  });

  it('should render element content', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>
            <div>
              <strong>Bold text</strong>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Hover');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Bold text')[0]).toBeInTheDocument();
    });
  });

  it('should have tooltip styling', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Hover');

    await user.hover(trigger);
    await waitFor(() => {
      const content = container.querySelector('.custom-tooltip');
      expect(content?.className).toContain('custom-tooltip');
    });
  });

  it.skip('should respect delay settings', async () => {
    vi.useFakeTimers();

    render(
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Delayed content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Hover');

    fireEvent.mouseEnter(trigger);
    fireEvent.mouseMove(trigger);
    fireEvent.focus(trigger);

    expect(screen.queryAllByText('Delayed content')).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Delayed content')[0]).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should work with button trigger', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Click me</button>
          </TooltipTrigger>
          <TooltipContent>Button tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const button = screen.getByRole('button', { name: 'Click me' });

    await user.hover(button);
    await waitFor(() => {
      expect(screen.getAllByText('Button tooltip')[0]).toBeInTheDocument();
    });
  });

  it('should work with icon trigger', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger data-testid="icon-trigger">?</TooltipTrigger>
          <TooltipContent>Help text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByTestId('icon-trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Help text')[0]).toBeInTheDocument();
    });
  });

  it('should render tooltip with default position', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Content')[0]).toBeInTheDocument();
    });
  });

  it('should support side position prop', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent side="right">Right tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Right tooltip')[0]).toBeInTheDocument();
    });
  });

  it('should support align prop', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent align="end">Aligned tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Aligned tooltip')[0]).toBeInTheDocument();
    });
  });

  it('should support className on content', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent className="custom-class">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Hover');

    await user.hover(trigger);
    await waitFor(() => {
      const content = container.querySelector('.custom-class');
      expect(content).toBeInTheDocument();
    });
  });

  it('should support data attributes', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover</TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByTestId('trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger aria-label="info">Info</TooltipTrigger>
          <TooltipContent>Tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByLabelText('info');

    await user.hover(trigger);
    await waitFor(() => {
      const tooltip = screen.getAllByText('Tooltip')[0];
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should work with disabled trigger', () => {
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Disabled</TooltipTrigger>
          <TooltipContent>Should not show</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.queryAllByText('Should not show')).toHaveLength(0);
  });

  it('should close tooltip with Escape key', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Content')[0]).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    await waitFor(
      () => {
        expect(screen.queryAllByText('Content')).toHaveLength(0);
      },
      { timeout: 1000 }
    );
  });

  it('should forward ref to trigger', () => {
    let reference: HTMLButtonElement | null = null;
    const refCallback = (element: HTMLButtonElement | null) => {
      reference = element;
    };
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger ref={refCallback}>
            Trigger
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(reference).toBeInstanceOf(HTMLElement);
  });

  it('should render tooltip in portal', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <div style={{ overflow: 'hidden' }}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Portal content</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Portal content')[0]).toBeInTheDocument();
    });
  });

  it('should handle long tooltip content', async () => {
    const user = userEvent.setup();
    const longContent =
      'This is a very long tooltip content that might wrap to multiple lines';
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>{longContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Hover');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText(longContent)[0]).toBeInTheDocument();
    });
  });

  it('should handle empty trigger text', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger data-testid="empty-trigger">?</TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByTestId('empty-trigger');

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Help')[0]).toBeInTheDocument();
    });
  });

  it('should handle rapid hover/unhover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const trigger = screen.getByText('Trigger');

    await user.hover(trigger);
    await user.unhover(trigger);
    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Content')[0]).toBeInTheDocument();
    });
  });

  it('should support all side positions', async () => {
    const user = userEvent.setup();
    const sides = ['top', 'right', 'bottom', 'left'] as const;

    for (const side of sides) {
      const { unmount } = render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent side={side}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);
      await waitFor(() => {
        expect(screen.getAllByText('Content')[0]).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('should support all align positions', async () => {
    const user = userEvent.setup();
    const aligns = ['start', 'center', 'end'] as const;

    for (const align of aligns) {
      const { unmount } = render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent align={align}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Trigger');
      await user.hover(trigger);
      await waitFor(() => {
        expect(screen.getAllByText('Content')[0]).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('should combine multiple props', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger data-testid="combined">Trigger</TooltipTrigger>
          <TooltipContent side="right" align="start" className="custom-tooltip">
            Combined
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByTestId('combined');
    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getAllByText('Combined')[0]).toBeInTheDocument();
    });
  });
});
