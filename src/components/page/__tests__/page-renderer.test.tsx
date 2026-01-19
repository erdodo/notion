import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageRenderer } from '../page-renderer'

// Mock dependencies
vi.mock('@/components/editor/document-header', () => ({
  DocumentHeader: ({ page, preview }: any) => (
    <div data-testid="document-header">
      <span>{page.title}</span>
      {preview && <span>Preview Mode</span>}
    </div>
  ),
}))

vi.mock('@/components/database/page-properties', () => ({
  PageProperties: ({ row }: any) => (
    <div data-testid="page-properties">
      <span>{row.cells?.length || 0} cells</span>
    </div>
  ),
}))

vi.mock('@/components/editor/document-editor', () => ({
  default: ({ documentId, initialContent, editable }: any) => (
    <div data-testid="document-editor">
      <span>Document ID: {documentId}</span>
      <span>Content: {initialContent || 'empty'}</span>
      <span>{editable ? 'Editable' : 'Not Editable'}</span>
    </div>
  ),
}))

describe('PageRenderer', () => {
  const mockPage = {
    id: 'page-1',
    title: 'Test Page',
    content: 'This is test content',
    isArchived: false,
    userId: 'user-1',
    parentId: null,
    isPublished: false,
    icon: '📄',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockDatabaseRow = {
    id: 'row-1',
    databaseId: 'db-1',
    values: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    cells: [
      { id: 'cell-1', rowId: 'row-1', propertyId: 'prop-1', value: 'value-1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cell-2', rowId: 'row-1', propertyId: 'prop-2', value: 'value-2', createdAt: new Date(), updatedAt: new Date() },
    ],
    database: {
      id: 'db-1',
      title: 'Test Database',
      pageId: 'page-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      properties: [
        { id: 'prop-1', databaseId: 'db-1', name: 'Name', type: 'text', createdAt: new Date(), updatedAt: new Date() },
        { id: 'prop-2', databaseId: 'db-1', name: 'Status', type: 'select', createdAt: new Date(), updatedAt: new Date() },
      ],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page renderer container', () => {
    render(<PageRenderer page={mockPage} />)

    const container = screen.getByTestId('document-header').closest('div')
    expect(container).toHaveClass('flex', 'flex-col', 'h-full', 'bg-background')
  })

  it('should render document header', () => {
    render(<PageRenderer page={mockPage} />)

    expect(screen.getByTestId('document-header')).toBeInTheDocument()
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('should pass page to document header', () => {
    render(<PageRenderer page={mockPage} />)

    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('should render document editor with page id', () => {
    render(<PageRenderer page={mockPage} />)

    expect(screen.getByTestId('document-editor')).toBeInTheDocument()
    expect(screen.getByText('Document ID: page-1')).toBeInTheDocument()
  })

  it('should pass initial content to document editor', () => {
    render(<PageRenderer page={mockPage} />)

    expect(screen.getByText('Content: This is test content')).toBeInTheDocument()
  })

  it('should render document editor as editable when not preview', () => {
    render(<PageRenderer page={mockPage} isPreview={false} />)

    expect(screen.getByText('Editable')).toBeInTheDocument()
  })

  it('should render document editor as not editable when preview mode', () => {
    render(<PageRenderer page={mockPage} isPreview={true} />)

    expect(screen.getByText('Preview Mode')).toBeInTheDocument()
    expect(screen.getByText('Not Editable')).toBeInTheDocument()
  })

  it('should render document editor as not editable when page is archived', () => {
    const archivedPage = { ...mockPage, isArchived: true }

    render(<PageRenderer page={archivedPage} isPreview={false} />)

    expect(screen.getByText('Not Editable')).toBeInTheDocument()
  })

  it('should not render page properties when row is not provided', () => {
    render(<PageRenderer page={mockPage} />)

    expect(screen.queryByTestId('page-properties')).not.toBeInTheDocument()
  })

  it('should render page properties when row is provided', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    expect(screen.getByTestId('page-properties')).toBeInTheDocument()
  })

  it('should pass row to page properties', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    expect(screen.getByText('2 cells')).toBeInTheDocument()
  })

  it('should render page properties with responsive layout', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const propertiesContainer = screen.getByTestId('page-properties').parentElement
    expect(propertiesContainer).toHaveClass('px-12', 'md:max-w-3xl', 'md:mx-auto', 'lg:max-w-4xl')
  })

  it('should render document editor with padding bottom', () => {
    render(<PageRenderer page={mockPage} />)

    const editorContainer = screen.getByTestId('document-editor').parentElement
    expect(editorContainer).toHaveClass('pb-40')
  })

  it('should render empty content when page has no content', () => {
    const pageNoContent = { ...mockPage, content: '' }

    render(<PageRenderer page={pageNoContent} />)

    expect(screen.getByText('Content: empty')).toBeInTheDocument()
  })

  it('should render with null content', () => {
    const pageNullContent = { ...mockPage, content: null as any }

    render(<PageRenderer page={pageNullContent} />)

    expect(screen.getByText('Content: empty')).toBeInTheDocument()
  })

  it('should handle multiple cells in database row', () => {
    const multiCellRow = {
      ...mockDatabaseRow,
      cells: [
        { id: 'cell-1', rowId: 'row-1', propertyId: 'prop-1', value: 'value-1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'cell-2', rowId: 'row-1', propertyId: 'prop-2', value: 'value-2', createdAt: new Date(), updatedAt: new Date() },
        { id: 'cell-3', rowId: 'row-1', propertyId: 'prop-3', value: 'value-3', createdAt: new Date(), updatedAt: new Date() },
      ],
    }

    render(<PageRenderer page={mockPage} row={multiCellRow} />)

    expect(screen.getByText('3 cells')).toBeInTheDocument()
  })

  it('should handle row with no cells', () => {
    const noCellRow = {
      ...mockDatabaseRow,
      cells: [],
    }

    render(<PageRenderer page={mockPage} row={noCellRow} />)

    expect(screen.getByText('0 cells')).toBeInTheDocument()
  })

  it('should render header before properties', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const header = screen.getByTestId('document-header')
    const properties = screen.getByTestId('page-properties')

    expect(header.compareDocumentPosition(properties)).toBe(
      header.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('should render properties before editor', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const properties = screen.getByTestId('page-properties')
    const editor = screen.getByTestId('document-editor')

    expect(properties.compareDocumentPosition(editor)).toBe(
      properties.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('should maintain correct order: header > properties > editor', () => {
    const { container } = render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const divs = Array.from(container.querySelectorAll('[data-testid]'))
    const order = divs.map(d => d.getAttribute('data-testid'))

    expect(order).toEqual(['document-header', 'page-properties', 'document-editor'])
  })

  it('should maintain correct order when no row: header > editor', () => {
    const { container } = render(<PageRenderer page={mockPage} />)

    const divs = Array.from(container.querySelectorAll('[data-testid]'))
    const order = divs.map(d => d.getAttribute('data-testid'))

    expect(order).toEqual(['document-header', 'document-editor'])
  })

  it('should render with relative positioning', () => {
    const { container } = render(<PageRenderer page={mockPage} />)

    const mainDiv = container.querySelector('[class*="relative"]')
    expect(mainDiv).toHaveClass('relative')
  })

  it('should render with group class for hover effects', () => {
    const { container } = render(<PageRenderer page={mockPage} />)

    const mainDiv = container.querySelector('[class*="group"]')
    expect(mainDiv).toHaveClass('group')
  })

  it('should handle preview mode with archived page', () => {
    const archivedPage = { ...mockPage, isArchived: true }

    render(<PageRenderer page={archivedPage} isPreview={true} />)

    expect(screen.getByText('Preview Mode')).toBeInTheDocument()
    expect(screen.getByText('Not Editable')).toBeInTheDocument()
  })

  it('should render document header with preview prop', () => {
    render(<PageRenderer page={mockPage} isPreview={true} />)

    expect(screen.getByText('Preview Mode')).toBeInTheDocument()
  })

  it('should not show preview mode when isPreview is false', () => {
    render(<PageRenderer page={mockPage} isPreview={false} />)

    expect(screen.queryByText('Preview Mode')).not.toBeInTheDocument()
  })

  it('should not show preview mode when isPreview is undefined', () => {
    render(<PageRenderer page={mockPage} />)

    expect(screen.queryByText('Preview Mode')).not.toBeInTheDocument()
  })

  it('should pass correct editable state when not archived and not preview', () => {
    render(<PageRenderer page={mockPage} isPreview={false} />)

    expect(screen.getByText('Editable')).toBeInTheDocument()
  })

  it('should pass correct editable state when archived but not preview', () => {
    const archivedPage = { ...mockPage, isArchived: true }

    render(<PageRenderer page={archivedPage} isPreview={false} />)

    expect(screen.getByText('Not Editable')).toBeInTheDocument()
  })

  it('should render full height container', () => {
    const { container } = render(<PageRenderer page={mockPage} />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('h-full')
  })

  it('should render flex column layout', () => {
    const { container } = render(<PageRenderer page={mockPage} />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'flex-col')
  })

  it('should handle long page title', () => {
    const longTitle = 'This is a very long page title that should still render correctly in the header'
    const pageWithLongTitle = { ...mockPage, title: longTitle }

    render(<PageRenderer page={pageWithLongTitle} />)

    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('should handle long content', () => {
    const longContent = 'A'.repeat(1000)
    const pageWithLongContent = { ...mockPage, content: longContent }

    render(<PageRenderer page={pageWithLongContent} />)

    expect(screen.getByText(`Content: ${longContent}`)).toBeInTheDocument()
  })

  it('should handle page with special characters in title', () => {
    const specialTitle = 'Test Page @#$%^&*()'
    const pageWithSpecialTitle = { ...mockPage, title: specialTitle }

    render(<PageRenderer page={pageWithSpecialTitle} />)

    expect(screen.getByText(specialTitle)).toBeInTheDocument()
  })

  it('should handle page with unicode characters', () => {
    const unicodeTitle = 'Test Page 中文 العربية 한글'
    const pageWithUnicode = { ...mockPage, title: unicodeTitle }

    render(<PageRenderer page={pageWithUnicode} />)

    expect(screen.getByText(unicodeTitle)).toBeInTheDocument()
  })

  it('should render all three main sections in order', () => {
    const { container } = render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const children = Array.from(container.querySelector('div.flex')?.children || [])
    expect(children.length).toBeGreaterThanOrEqual(3)
  })

  it('should handle row with different property types', () => {
    const complexRow = {
      ...mockDatabaseRow,
      database: {
        ...mockDatabaseRow.database,
        properties: [
          { id: 'prop-1', databaseId: 'db-1', name: 'Text', type: 'text', createdAt: new Date(), updatedAt: new Date() },
          { id: 'prop-2', databaseId: 'db-1', name: 'Number', type: 'number', createdAt: new Date(), updatedAt: new Date() },
          { id: 'prop-3', databaseId: 'db-1', name: 'Date', type: 'date', createdAt: new Date(), updatedAt: new Date() },
          { id: 'prop-4', databaseId: 'db-1', name: 'Select', type: 'select', createdAt: new Date(), updatedAt: new Date() },
        ],
      },
    }

    render(<PageRenderer page={mockPage} row={complexRow} />)

    expect(screen.getByTestId('page-properties')).toBeInTheDocument()
  })

  it('should handle edge case: page with minimal data', () => {
    const minimalPage = {
      id: 'p1',
      title: '',
      content: '',
      isArchived: false,
      userId: 'u1',
      parentId: null,
      isPublished: false,
      icon: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<PageRenderer page={minimalPage} />)

    expect(screen.getByTestId('document-editor')).toBeInTheDocument()
  })

  it('should be responsive on medium screen', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const propertiesContainer = screen.getByTestId('page-properties').parentElement
    expect(propertiesContainer).toHaveClass('md:max-w-3xl')
  })

  it('should be responsive on large screen', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const propertiesContainer = screen.getByTestId('page-properties').parentElement
    expect(propertiesContainer).toHaveClass('lg:max-w-4xl')
  })

  it('should have horizontal padding on properties', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const propertiesContainer = screen.getByTestId('page-properties').parentElement
    expect(propertiesContainer).toHaveClass('px-12')
  })

  it('should center properties on medium+ screens', () => {
    render(<PageRenderer page={mockPage} row={mockDatabaseRow} />)

    const propertiesContainer = screen.getByTestId('page-properties').parentElement
    expect(propertiesContainer).toHaveClass('md:mx-auto')
  })
})
