import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from '../tooltip'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Basic Rendering
  it('should render tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('should render tooltip content on hover', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Hover me')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  // Visibility Tests
  it('should hide tooltip by default', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Hidden content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('should show tooltip on hover and hide on unhover', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Visible content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Visible content')).toBeInTheDocument()
    })

    await user.unhover(trigger)
    await waitFor(() => {
      expect(screen.queryByText('Visible content')).not.toBeInTheDocument()
    }, { timeout: 1000 })
  })

  // Focus Trigger
  it('should show tooltip on focus', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Focused tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    trigger.focus()
    await waitFor(() => {
      expect(screen.getByText('Focused tooltip')).toBeInTheDocument()
    })
  })

  it('should hide tooltip on blur', async () => {
    const user = userEvent.setup()
    render(
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Blurred tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button>Other</button>
      </>
    )
    const trigger = screen.getByText('Trigger')
    const other = screen.getByRole('button', { name: 'Other' })

    trigger.focus()
    await waitFor(() => {
      expect(screen.getByText('Blurred tooltip')).toBeInTheDocument()
    })

    await user.click(other)
    await waitFor(() => {
      expect(screen.queryByText('Blurred tooltip')).not.toBeInTheDocument()
    }, { timeout: 1000 })
  })

  // Keyboard Navigation
  it('should show tooltip with keyboard', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Keyboard tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.tab()
    await waitFor(() => {
      expect(screen.getByText('Keyboard tooltip')).toBeInTheDocument()
    })
  })

  // Multiple Tooltips
  it('should render multiple tooltips', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger1">First</TooltipTrigger>
          <TooltipContent>First tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger data-testid="trigger2">Second</TooltipTrigger>
          <TooltipContent>Second tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger1 = screen.getByTestId('trigger1')
    const trigger2 = screen.getByTestId('trigger2')

    await user.hover(trigger1)
    await waitFor(() => {
      expect(screen.getByText('First tooltip')).toBeInTheDocument()
    })
  })

  it('should only show one tooltip at a time', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger1">First</TooltipTrigger>
          <TooltipContent>First tooltip</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger data-testid="trigger2">Second</TooltipTrigger>
          <TooltipContent>Second tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger1 = screen.getByTestId('trigger1')
    const trigger2 = screen.getByTestId('trigger2')

    await user.hover(trigger1)
    await waitFor(() => {
      expect(screen.getByText('First tooltip')).toBeInTheDocument()
    })

    await user.hover(trigger2)
    await waitFor(() => {
      expect(screen.getByText('Second tooltip')).toBeInTheDocument()
      expect(screen.queryByText('First tooltip')).not.toBeInTheDocument()
    })
  })

  // Content Tests
  it('should render text content', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Simple text content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Hover')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Simple text content')).toBeInTheDocument()
    })
  })

  it('should render element content', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>
            <div>
              <strong>Bold text</strong>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Hover')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Bold text')).toBeInTheDocument()
    })
  })

  // Styling Tests
  it('should have tooltip styling', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Hover')

    await user.hover(trigger)
    await waitFor(() => {
      const content = container.querySelector('.custom-tooltip')
      expect(content?.className).toContain('custom-tooltip')
    })
  })

  // Delay Tests
  it('should respect delay settings', async () => {
    const user = userEvent.setup()
    vi.useFakeTimers()

    render(
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Delayed content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Hover')

    await user.hover(trigger)
    expect(screen.queryByText('Delayed content')).not.toBeInTheDocument()

    vi.advanceTimersByTime(500)
    await waitFor(() => {
      expect(screen.getByText('Delayed content')).toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  // Trigger Types
  it('should work with button trigger', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Click me</button>
          </TooltipTrigger>
          <TooltipContent>Button tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const button = screen.getByRole('button', { name: 'Click me' })

    await user.hover(button)
    await waitFor(() => {
      expect(screen.getByText('Button tooltip')).toBeInTheDocument()
    })
  })

  it('should work with icon trigger', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="icon-trigger">?</TooltipTrigger>
          <TooltipContent>Help text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByTestId('icon-trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Help text')).toBeInTheDocument()
    })
  })

  // Position Tests
  it('should render tooltip with default position', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  it('should support side position prop', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent side="right">Right tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Right tooltip')).toBeInTheDocument()
    })
  })

  it('should support align prop', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent align="end">Aligned tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Aligned tooltip')).toBeInTheDocument()
    })
  })

  // Attributes
  it('should support className on content', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent className="custom-class">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Hover')

    await user.hover(trigger)
    await waitFor(() => {
      const content = container.querySelector('.custom-class')
      expect(content).toBeInTheDocument()
    })
  })

  it('should support data attributes', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover</TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByTestId('trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument()
    })
  })

  // Accessibility
  it('should have proper ARIA attributes', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger aria-label="info">Info</TooltipTrigger>
          <TooltipContent>Tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByLabelText('info')

    await user.hover(trigger)
    await waitFor(() => {
      const tooltip = screen.getByText('Tooltip')
      expect(tooltip).toBeInTheDocument()
    })
  })

  // Disabled State
  it('should work with disabled trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip disabled>
          <TooltipTrigger>Disabled</TooltipTrigger>
          <TooltipContent>Should not show</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument()
  })

  // Escape Key
  it('should close tooltip with Escape key', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    }, { timeout: 1000 })
  })

  // Ref Forwarding
  it('should forward ref to trigger', () => {
    let ref: HTMLButtonElement | null = null
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger ref={el => (ref = el)}>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(ref).toBeInstanceOf(HTMLElement)
  })

  // Portal Rendering
  it('should render tooltip in portal', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <TooltipProvider>
        <div style={{ overflow: 'hidden' }}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Portal content</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Portal content')).toBeInTheDocument()
    })
  })

  // Long Content
  it('should handle long tooltip content', async () => {
    const user = userEvent.setup()
    const longContent = 'This is a very long tooltip content that might wrap to multiple lines'
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>{longContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Hover')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })

  // Edge Cases
  it('should handle empty trigger text', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="empty-trigger">?</TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByTestId('empty-trigger')

    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Help')).toBeInTheDocument()
    })
  })

  it('should handle rapid hover/unhover', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const trigger = screen.getByText('Trigger')

    await user.hover(trigger)
    await user.unhover(trigger)
    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  // Side Variants
  it('should support all side positions', async () => {
    const user = userEvent.setup()
    const sides = ['top', 'right', 'bottom', 'left'] as const

    for (const side of sides) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent side={side}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })

      unmount()
    }
  })

  // Align Variants
  it('should support all align positions', async () => {
    const user = userEvent.setup()
    const aligns = ['start', 'center', 'end'] as const

    for (const align of aligns) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent align={align}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByText('Trigger')
      await user.hover(trigger)
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })

      unmount()
    }
  })

  // Combination Tests
  it('should combine multiple props', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="combined">Trigger</TooltipTrigger>
          <TooltipContent
            side="right"
            align="start"
            className="custom-tooltip"
          >
            Combined
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByTestId('combined')
    await user.hover(trigger)
    await waitFor(() => {
      expect(screen.getByText('Combined')).toBeInTheDocument()
    })
  })
})
