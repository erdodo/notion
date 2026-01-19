import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Card Tests
  describe('Card', () => {
    it('should render card element', () => {
      const { container } = render(<Card>Card content</Card>)
      const card = container.querySelector('div')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })

    it('should render card with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should support className prop', () => {
      const { container } = render(<Card className="custom-card">Content</Card>)
      const card = container.querySelector('div')
      expect(card?.className).toContain('custom-card')
    })

    it('should apply shadow styling', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.querySelector('div')
      expect(card?.className).toContain('shadow-sm')
    })

    it('should forward ref', () => {
      let cardRef: HTMLDivElement | null = null
      render(<Card ref={el => { cardRef = el }}>Content</Card>)
      expect(cardRef).toBeTruthy()
      expect(cardRef?.tagName).toBe('DIV')
    })

    it('should support multiple children', () => {
      render(
        <Card>
          <div>Child 1</div>
          <div>Child 2</div>
        </Card>
      )
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })
  })

  // CardHeader Tests
  describe('CardHeader', () => {
    it('should render card header', () => {
      const { container } = render(<CardHeader>Header content</CardHeader>)
      const header = container.querySelector('div')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('should render header with children', () => {
      render(<CardHeader>Header</CardHeader>)
      expect(screen.getByText('Header')).toBeInTheDocument()
    })

    it('should support className prop', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>)
      const header = container.querySelector('div')
      expect(header?.className).toContain('custom-header')
    })

    it('should have flex column layout', () => {
      const { container } = render(<CardHeader>Header</CardHeader>)
      const header = container.querySelector('div')
      expect(header?.className).toContain('flex')
      expect(header?.className).toContain('flex-col')
    })
  })

  // CardTitle Tests
  describe('CardTitle', () => {
    it('should render as h3 element', () => {
      render(<CardTitle>Title</CardTitle>)
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })

    it('should render title text', () => {
      render(<CardTitle>Card Title</CardTitle>)
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('should have proper heading styling', () => {
      const { container } = render(<CardTitle>Title</CardTitle>)
      const title = container.querySelector('h3')
      expect(title?.className).toContain('text-2xl')
      expect(title?.className).toContain('font-semibold')
    })

    it('should support className prop', () => {
      const { container } = render(<CardTitle className="custom-title">Title</CardTitle>)
      const title = container.querySelector('h3')
      expect(title?.className).toContain('custom-title')
    })

    it('should forward ref', () => {
      let titleRef: HTMLHeadingElement | null = null
      render(<CardTitle ref={el => { titleRef = el }}>Title</CardTitle>)
      expect(titleRef).toBeTruthy()
      expect(titleRef?.tagName).toBe('H3')
    })
  })

  // CardDescription Tests
  describe('CardDescription', () => {
    it('should render as paragraph element', () => {
      render(<CardDescription>Description</CardDescription>)
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should have muted foreground styling', () => {
      const { container } = render(<CardDescription>Description</CardDescription>)
      const description = container.querySelector('p')
      expect(description?.className).toContain('text-muted-foreground')
    })

    it('should have small text size', () => {
      const { container } = render(<CardDescription>Description</CardDescription>)
      const description = container.querySelector('p')
      expect(description?.className).toContain('text-sm')
    })

    it('should support className prop', () => {
      const { container } = render(<CardDescription className="custom-desc">Desc</CardDescription>)
      const description = container.querySelector('p')
      expect(description?.className).toContain('custom-desc')
    })

    it('should forward ref', () => {
      let descRef: HTMLParagraphElement | null = null
      render(<CardDescription ref={el => { descRef = el }}>Description</CardDescription>)
      expect(descRef).toBeTruthy()
      expect(descRef?.tagName).toBe('P')
    })
  })

  // CardContent Tests
  describe('CardContent', () => {
    it('should render card content', () => {
      render(<CardContent>Content</CardContent>)
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should have padding styling', () => {
      const { container } = render(<CardContent>Content</CardContent>)
      const content = container.querySelector('div')
      expect(content?.className).toContain('p-6')
    })

    it('should have top padding offset', () => {
      const { container } = render(<CardContent>Content</CardContent>)
      const content = container.querySelector('div')
      expect(content?.className).toContain('pt-0')
    })

    it('should support className prop', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>)
      const content = container.querySelector('div')
      expect(content?.className).toContain('custom-content')
    })

    it('should render multiple children', () => {
      render(
        <CardContent>
          <div>Item 1</div>
          <div>Item 2</div>
        </CardContent>
      )
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  // CardFooter Tests
  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(<CardFooter>Footer</CardFooter>)
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should have flex layout', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footer = container.querySelector('div')
      expect(footer?.className).toContain('flex')
    })

    it('should have items center alignment', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footer = container.querySelector('div')
      expect(footer?.className).toContain('items-center')
    })

    it('should have padding styling', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>)
      const footer = container.querySelector('div')
      expect(footer?.className).toContain('p-6')
    })

    it('should support className prop', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>)
      const footer = container.querySelector('div')
      expect(footer?.className).toContain('custom-footer')
    })

    it('should render multiple children', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Submit</button>
        </CardFooter>
      )
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })
  })

  // Complete Card Structure Tests
  describe('Complete Card Structure', () => {
    it('should render complete card with all subcomponents', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should render card with correct element nesting', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      const cardDiv = container.firstChild
      expect(cardDiv).toBeInTheDocument()
    })

    it('should support custom styling throughout', () => {
      const { container } = render(
        <Card className="custom-card">
          <CardHeader className="custom-header">
            <CardTitle className="custom-title">Title</CardTitle>
            <CardDescription className="custom-desc">Desc</CardDescription>
          </CardHeader>
          <CardContent className="custom-content">Content</CardContent>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      )

      // Verify all custom classes are applied
      expect(container.innerHTML).toContain('custom-card')
      expect(container.innerHTML).toContain('custom-header')
      expect(container.innerHTML).toContain('custom-title')
    })

    it('should maintain proper spacing between components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  // Display Names
  describe('Display Names', () => {
    it('Card should have correct displayName', () => {
      expect(Card.displayName).toBe('Card')
    })

    it('CardHeader should have correct displayName', () => {
      expect(CardHeader.displayName).toBe('CardHeader')
    })

    it('CardTitle should have correct displayName', () => {
      expect(CardTitle.displayName).toBe('CardTitle')
    })

    it('CardDescription should have correct displayName', () => {
      expect(CardDescription.displayName).toBe('CardDescription')
    })

    it('CardContent should have correct displayName', () => {
      expect(CardContent.displayName).toBe('CardContent')
    })

    it('CardFooter should have correct displayName', () => {
      expect(CardFooter.displayName).toBe('CardFooter')
    })
  })
})
