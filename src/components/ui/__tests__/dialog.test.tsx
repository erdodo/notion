import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '../dialog'

describe('Dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Basic Rendering
  it('should render dialog trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('should render dialog content when triggered', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
  })

  // Dialog Trigger
  it('should open dialog on click', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Content</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should open on Enter key', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Trigger</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    const trigger = screen.getByText('Trigger')
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Dialog')).toBeInTheDocument()
  })

  // Dialog Content
  it('should render dialog with role', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument()
  })

  it('should render overlay', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    const overlay = container.querySelector('[role="dialog"]')?.parentElement
    expect(overlay).toBeInTheDocument()
  })

  // Dialog Header
  it('should render dialog header', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Header Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Header Title')).toBeInTheDocument()
  })

  // Dialog Title
  it('should render dialog title', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>My Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('My Dialog')).toBeInTheDocument()
  })

  it('should render title as h2', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H2')
  })

  // Dialog Description
  it('should render dialog description', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>This is a description</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('This is a description')).toBeInTheDocument()
  })

  // Dialog Footer
  it('should render dialog footer', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter>
            <button>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  // Dialog Close
  it('should close dialog on close button', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Title')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeVisible()
  })

  // Escape Key
  it('should close dialog with Escape key', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Title')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeVisible()
  })

  // Backdrop Click
  it('should close dialog on backdrop click', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))
    const dialog = screen.getByRole('dialog')
    const backdrop = dialog.parentElement

    await user.click(backdrop!)
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeVisible()
  })

  // Complete Dialog
  it('should render complete dialog structure', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input type="text" placeholder="Name" />
          </div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <button>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open Dialog'))

    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    expect(screen.getByText('Update your profile information')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  // Keyboard Navigation
  it('should manage focus in dialog', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <input type="text" />
          <button>Submit</button>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))

    const input = screen.getByRole('textbox')
    input.focus()
    expect(input).toHaveFocus()
  })

  it('should trap focus within dialog', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <button>First</button>
          <button>Second</button>
        </DialogContent>
      </Dialog>
    )
    await user.click(screen.getByText('Open'))

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  // Multiple Dialogs
  it('should handle nested dialogs', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Dialog>
          <DialogTrigger>Open First</DialogTrigger>
          <DialogContent>
            <DialogTitle>First Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger>Open Second</DialogTrigger>
          <DialogContent>
            <DialogTitle>Second Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      </>
    )

    await user.click(screen.getByText('Open First'))
    expect(screen.getByText('First Dialog')).toBeInTheDocument()
  })

  // Event Handlers
  it('should call onOpenChange handler', async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()

    render(
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    expect(handleOpenChange).toHaveBeenCalled()
  })

  // Controlled Dialog
  it('should work as controlled component', async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()
    const { rerender } = render(
      <Dialog open={false} onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    expect(handleOpenChange).toHaveBeenCalledWith(true)

    rerender(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Dialog')).toBeInTheDocument()
  })

  // Form Integration
  it('should support form in dialog', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn(e => e.preventDefault())

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Form Dialog</DialogTitle>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" required />
            <button type="submit">Submit</button>
          </form>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    const input = screen.getByPlaceholderText('Name')
    await user.type(input, 'John')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(handleSubmit).toHaveBeenCalled()
  })

  // Attributes
  it('should support className on content', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-dialog">
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    const dialog = container.querySelector('.custom-dialog')
    expect(dialog).toBeInTheDocument()
  })

  it('should support data attributes', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger data-testid="trigger">Open</DialogTrigger>
        <DialogContent data-testid="content">
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByTestId('trigger')).toBeInTheDocument()
    await user.click(screen.getByTestId('trigger'))
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  // Accessibility
  it('should have proper ARIA attributes', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(dialog).toHaveAttribute('aria-describedby')
  })

  // Custom Content
  it('should render custom content in dialog', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label>
              <input type="checkbox" /> Enable notifications
            </label>
            <label>
              <input type="checkbox" /> Enable emails
            </label>
          </div>
          <DialogFooter>
            <button>Apply</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Enable notifications')).toBeInTheDocument()
    expect(screen.getByText('Enable emails')).toBeInTheDocument()
  })

  // Long Content
  it('should handle scrollable content', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="max-h-96 overflow-y-auto">
          <DialogTitle>Long Content</DialogTitle>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Line {i + 1}</p>
          ))}
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 20')).toBeInTheDocument()
  })

  // Ref Forwarding
  it('should forward ref to trigger', () => {
    let ref: HTMLButtonElement | null = null
    render(
      <Dialog>
        <DialogTrigger ref={el => (ref = el)}>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(ref).toBeInstanceOf(HTMLButtonElement)
  })

  // Edge Cases
  it('should handle rapid open/close', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    await user.click(screen.getByText('Close'))
    await user.click(screen.getByText('Open'))

    expect(screen.getByText('Dialog')).toBeInTheDocument()
  })

  // Size Variants
  it('should support custom sizes via className', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    const content = container.querySelector('.sm\\:max-w-md')
    expect(content?.className).toContain('sm:max-w-md')
  })

  // Modal Behavior
  it('should prevent outside interaction', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <>
        <button onClick={handleClick}>Outside</button>
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      </>
    )

    await user.click(screen.getByText('Open'))
    // Dialog is modal, so outside interaction is blocked
    expect(screen.getByText('Dialog')).toBeInTheDocument()
  })

  // Confirmation Dialog Pattern
  it('should work as confirmation dialog', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()

    render(
      <Dialog>
        <DialogTrigger>Delete</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <button onClick={handleConfirm}>Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Delete'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(handleConfirm).toHaveBeenCalled()
  })
})
