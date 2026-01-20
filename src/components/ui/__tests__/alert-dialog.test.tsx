import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../alert-dialog'

describe('AlertDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Basic Rendering
  it('should render alert dialog trigger button', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should render alert dialog content when triggered', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    const trigger = screen.getByText('Open')
    await user.click(trigger)
    expect(screen.getByText('Confirmation')).toBeInTheDocument()
  })

  // AlertDialogTrigger Tests
  it('should trigger dialog on click', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Trigger</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Dialog</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    expect(screen.queryByText('Dialog')).not.toBeInTheDocument()
    await user.click(screen.getByText('Trigger'))
    expect(screen.getByText('Dialog')).toBeInTheDocument()
  })

  it('should trigger dialog on Enter key', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Trigger</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Dialog</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    const trigger = screen.getByText('Trigger')
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Dialog')).toBeInTheDocument()
  })

  it('should trigger dialog on Space key', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Trigger</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Dialog</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    const trigger = screen.getByText('Trigger')
    trigger.focus()
    await user.keyboard(' ')
    expect(screen.getByText('Dialog')).toBeInTheDocument()
  })

  // AlertDialogContent Tests
  it('should render dialog content with overlay', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Content</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('should render dialog with proper styling', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent className="custom-dialog">
          <AlertDialogTitle>Content</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const content = screen.getByRole('alertdialog')
    expect(content.className).toContain('custom-dialog')
  })

  // AlertDialogHeader Tests
  it('should render header', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Header</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  // AlertDialogTitle Tests
  it('should render title', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Action</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  it('should render title as h2 element', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H2')
  })

  // AlertDialogDescription Tests
  it('should render description', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogDescription>This is a description</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('This is a description')).toBeInTheDocument()
  })

  // AlertDialogAction Tests
  it('should render action button', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('should call action handler on click', async () => {
    const user = userEvent.setup()
    const handleAction = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const button = screen.getByRole('button', { name: 'Confirm' })
    await user.click(button)
    expect(handleAction).toHaveBeenCalled()
  })

  it('should apply destructive variant to action', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('bg-destructive')
  })

  // AlertDialogCancel Tests
  it('should render cancel button', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should close dialog on cancel button click', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Title')).toBeInTheDocument()
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    // Dialog should be closed
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('should call cancel handler on click', async () => {
    const user = userEvent.setup()
    const handleCancel = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    expect(handleCancel).toHaveBeenCalled()
  })

  // AlertDialogFooter Tests
  it('should render footer', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  // Complete Dialog Tests
  it('should render complete alert dialog', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Delete Item'))
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  // Keyboard Navigation
  it('should close dialog with Escape key', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Title')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('should navigate between buttons with Tab', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    await user.keyboard('{Tab}')
    expect(buttons[1]).toHaveFocus()
  })

  // Confirm Delete Pattern
  it('should handle confirm delete pattern', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Delete'))
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(deleteButton)
    expect(handleDelete).toHaveBeenCalled()
  })

  // Confirm Action Pattern
  it('should handle confirm action pattern', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Logout</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Yes, logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Logout'))
    const confirmButton = screen.getByRole('button', { name: 'Yes, logout' })
    await user.click(confirmButton)
    expect(handleConfirm).toHaveBeenCalled()
  })

  // Multiple Dialogs
  it('should render multiple alert dialogs', async () => {
    const user = userEvent.setup()
    render(
      <>
        <AlertDialog>
          <AlertDialogTrigger>First</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>First Dialog</AlertDialogTitle>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger>Second</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Second Dialog</AlertDialogTitle>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
    await user.click(screen.getByText('First'))
    expect(screen.getByText('First Dialog')).toBeInTheDocument()
  })

  // Accessibility Tests
  it('should have proper role', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Dialog</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('should have aria-describedby', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription>Description text</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-describedby')
  })

  // Focus Management
  it('should manage focus correctly', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
  })

  // Custom Content
  it('should render custom content in dialog', async () => {
    const user = userEvent.setup()
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Custom Content</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4">
            <p>This is custom content</p>
            <input type="text" placeholder="Type something..." />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText('This is custom content')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument()
  })

  // Ref Forwarding
  it('should forward ref to trigger button', () => {
    let ref: HTMLButtonElement | null = null
    render(
      <AlertDialog>
        <AlertDialogTrigger ref={el => (ref = el)}>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    expect(ref).toBeInstanceOf(HTMLButtonElement)
  })

  // Edge Cases
  it('should handle long content', async () => {
    const user = userEvent.setup()
    const longText = 'This is a very long description that might wrap to multiple lines in the alert dialog.'
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription>{longText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await user.click(screen.getByText('Open'))
    expect(screen.getByText(longText)).toBeInTheDocument()
  })
})
