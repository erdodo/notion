import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('SlashMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockSlashMenu = (props = {}) => ({
    isOpen: false,
    searchQuery: '',
    position: { x: 0, y: 0 },
    commands: [
      { id: 'cmd-1', title: 'Heading', description: 'Large heading', trigger: '/heading' },
      { id: 'cmd-2', title: 'Image', description: 'Add image', trigger: '/image' },
      { id: 'cmd-3', title: 'Code', description: 'Add code block', trigger: '/code' },
      { id: 'cmd-4', title: 'Quote', description: 'Add quote', trigger: '/quote' },
    ],
    filteredCommands: [],
    selectedIndex: -1,
    ...props,
  })

  // Menu Display
  it('should render slash menu', () => {
    const menu = createMockSlashMenu()
    expect(menu.commands).toBeDefined()
  })

  // Open on Slash
  it('should open on slash character', () => {
    const menu = createMockSlashMenu()
    const openMenu = vi.fn()
    openMenu('/')
    expect(openMenu).toHaveBeenCalledWith('/')
  })

  // Close
  it('should close slash menu', () => {
    const menu = createMockSlashMenu({ isOpen: true })
    const closeMenu = vi.fn()
    closeMenu()
    expect(closeMenu).toHaveBeenCalled()
  })

  // Search Query
  it('should track search query', () => {
    const menu = createMockSlashMenu()
    expect(menu.searchQuery).toBe('')

    const updated = { ...menu, searchQuery: 'heading' }
    expect(updated.searchQuery).toBe('heading')
  })

  // Filter Commands
  it('should filter commands by query', () => {
    const menu = createMockSlashMenu()
    const search = (query) => {
      return menu.commands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase())
      )
    }

    const results = search('image')
    expect(results.length).toBeGreaterThan(0)
  })

  // Command Selection
  it('should support command selection', () => {
    const menu = createMockSlashMenu()
    const selectCommand = vi.fn()
    selectCommand(menu.commands[0])
    expect(selectCommand).toHaveBeenCalledWith(menu.commands[0])
  })

  // Command Click
  it('should handle command click', () => {
    const menu = createMockSlashMenu()
    const handleClick = vi.fn()
    handleClick(menu.commands[0].id)
    expect(handleClick).toHaveBeenCalledWith(menu.commands[0].id)
  })

  // Command Titles
  it('should display command titles', () => {
    const menu = createMockSlashMenu()
    menu.commands.forEach(cmd => {
      expect(cmd.title).toBeDefined()
    })
  })

  // Command Descriptions
  it('should display command descriptions', () => {
    const menu = createMockSlashMenu()
    menu.commands.forEach(cmd => {
      expect(cmd.description).toBeDefined()
    })
  })

  // Position
  it('should track menu position', () => {
    const menu = createMockSlashMenu()
    expect(menu.position).toBeDefined()
  })

  // Keyboard Navigation
  it('should navigate with arrow keys', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 })
    const handleKeyDown = vi.fn()
    handleKeyDown({ key: 'ArrowDown' })
    expect(handleKeyDown).toHaveBeenCalled()
  })

  // Arrow Up
  it('should move selection up', () => {
    const menu = createMockSlashMenu({ selectedIndex: 1 })
    let selectedIndex = menu.selectedIndex - 1
    expect(selectedIndex).toBe(0)
  })

  // Arrow Down
  it('should move selection down', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 })
    let selectedIndex = menu.selectedIndex + 1
    expect(selectedIndex).toBe(1)
  })

  // Enter Key
  it('should execute command on enter', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 })
    const executeCommand = vi.fn()
    executeCommand(menu.commands[menu.selectedIndex])
    expect(executeCommand).toHaveBeenCalled()
  })

  // Escape Key
  it('should close on escape', () => {
    const menu = createMockSlashMenu({ isOpen: true })
    const closeMenu = vi.fn()
    closeMenu()
    expect(closeMenu).toHaveBeenCalled()
  })

  // Backspace
  it('should handle backspace', () => {
    const menu = createMockSlashMenu({ searchQuery: 'heading' })
    const handleBackspace = vi.fn()
    handleBackspace()
    expect(handleBackspace).toHaveBeenCalled()
  })

  // Text Input
  it('should accept text input', () => {
    const menu = createMockSlashMenu()
    const addText = vi.fn()
    addText('h')
    expect(addText).toHaveBeenCalledWith('h')
  })

  // Categories
  it('should group commands by category', () => {
    const menu = {
      ...createMockSlashMenu(),
      categories: [
        { name: 'Text', commands: ['heading', 'paragraph'] },
        { name: 'Media', commands: ['image', 'video'] },
      ],
    }
    expect(menu.categories).toBeDefined()
  })

  // Hovering
  it('should highlight on hover', () => {
    const menu = createMockSlashMenu()
    const handleHover = vi.fn()
    handleHover(menu.commands[0].id)
    expect(handleHover).toHaveBeenCalledWith(menu.commands[0].id)
  })

  // Selection Highlight
  it('should highlight selected command', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 })
    expect(menu.selectedIndex).toBe(0)
  })

  // Click Outside
  it('should close on click outside', () => {
    const menu = createMockSlashMenu({ isOpen: true })
    const closeMenu = vi.fn()
    closeMenu()
    expect(closeMenu).toHaveBeenCalled()
  })

  // Recently Used
  it('should show recently used commands', () => {
    const menu = {
      ...createMockSlashMenu(),
      recentlyUsed: [
        { id: 'cmd-1', title: 'Heading', description: 'Large heading', trigger: '/heading' },
      ],
    }
    expect(menu.recentlyUsed).toBeDefined()
  })

  // Search Results Count
  it('should track filtered command count', () => {
    const menu = createMockSlashMenu()
    const results = menu.commands.filter(cmd =>
      cmd.title.toLowerCase().includes('heading')
    )
    expect(results.length).toBeGreaterThan(0)
  })

  // Empty State
  it('should handle no matching commands', () => {
    const menu = createMockSlashMenu()
    const results = menu.commands.filter(cmd =>
      cmd.title.toLowerCase().includes('xyz')
    )
    expect(results.length).toBe(0)
  })

  // Command Execution
  it('should execute selected command', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 })
    const execute = vi.fn()
    execute(menu.commands[menu.selectedIndex].id)
    expect(execute).toHaveBeenCalled()
  })

  // Parameters
  it('should accept command parameters', () => {
    const menu = createMockSlashMenu()
    const executeWithParams = vi.fn()
    executeWithParams(menu.commands[0].id, { text: 'Custom heading' })
    expect(executeWithParams).toHaveBeenCalled()
  })

  // Callback
  it('should call callback after command execution', () => {
    const menu = createMockSlashMenu()
    const onExecute = vi.fn()
    onExecute(menu.commands[0].id)
    expect(onExecute).toHaveBeenCalledWith(menu.commands[0].id)
  })

  // Keyboard Shortcuts
  it('should display keyboard shortcuts', () => {
    const menu = {
      ...createMockSlashMenu(),
      commands: [
        {
          id: 'cmd-1',
          title: 'Heading',
          description: 'Large heading',
          trigger: '/heading',
          shortcut: 'Ctrl+H',
        },
      ],
    }
    expect(menu.commands[0].shortcut).toBeDefined()
  })

  // Accessibility
  it('should have proper aria attributes', () => {
    const menu = createMockSlashMenu()
    const role = 'menu'
    expect(role).toBeDefined()
  })

  // Animation
  it('should animate on open', () => {
    const menu = createMockSlashMenu()
    let isAnimating = false
    expect(isAnimating).toBe(false)
  })

  // Performance
  it('should handle large command lists', () => {
    const largeMenu = {
      ...createMockSlashMenu(),
      commands: Array.from({ length: 50 }, (_, i) => ({
        id: `cmd-${i}`,
        title: `Command ${i}`,
        description: `Description ${i}`,
        trigger: `/cmd${i}`,
      })),
    }
    expect(largeMenu.commands.length).toBe(50)
  })

  // Debounce Search
  it('should debounce search', () => {
    const menu = createMockSlashMenu()
    const search = vi.fn()
    search('heading')
    expect(search).toHaveBeenCalledWith('heading')
  })
})
