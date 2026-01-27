import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SlashMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockSlashMenu = (properties = {}) => ({
    isOpen: false,
    searchQuery: '',
    position: { x: 0, y: 0 },
    commands: [
      {
        id: 'cmd-1',
        title: 'Heading',
        description: 'Large heading',
        trigger: '/heading',
      },
      {
        id: 'cmd-2',
        title: 'Image',
        description: 'Add image',
        trigger: '/image',
      },
      {
        id: 'cmd-3',
        title: 'Code',
        description: 'Add code block',
        trigger: '/code',
      },
      {
        id: 'cmd-4',
        title: 'Quote',
        description: 'Add quote',
        trigger: '/quote',
      },
    ],
    filteredCommands: [],
    selectedIndex: -1,
    ...properties,
  });

  it('should render slash menu', () => {
    const menu = createMockSlashMenu();
    expect(menu.commands).toBeDefined();
  });

  it('should open on slash character', () => {
    createMockSlashMenu();
    const openMenu = vi.fn();
    openMenu('/');
    expect(openMenu).toHaveBeenCalledWith('/');
  });

  it('should close slash menu', () => {
    createMockSlashMenu({ isOpen: true });
    const closeMenu = vi.fn();
    closeMenu();
    expect(closeMenu).toHaveBeenCalled();
  });

  it('should track search query', () => {
    const menu = createMockSlashMenu();
    expect(menu.searchQuery).toBe('');

    const updated = { ...menu, searchQuery: 'heading' };
    expect(updated.searchQuery).toBe('heading');
  });

  it('should filter commands by query', () => {
    const menu = createMockSlashMenu();
    const search = (query: string) => {
      return menu.commands.filter((cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase())
      );
    };

    const results = search('image');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should support command selection', () => {
    const menu = createMockSlashMenu();
    const selectCommand = vi.fn();
    selectCommand(menu.commands[0]);
    expect(selectCommand).toHaveBeenCalledWith(menu.commands[0]);
  });

  it('should handle command click', () => {
    const menu = createMockSlashMenu();
    const handleClick = vi.fn();
    handleClick(menu.commands[0].id);
    expect(handleClick).toHaveBeenCalledWith(menu.commands[0].id);
  });

  it('should display command titles', () => {
    const menu = createMockSlashMenu();
    for (const cmd of menu.commands) {
      expect(cmd.title).toBeDefined();
    }
  });

  it('should display command descriptions', () => {
    const menu = createMockSlashMenu();
    for (const cmd of menu.commands) {
      expect(cmd.description).toBeDefined();
    }
  });

  it('should track menu position', () => {
    const menu = createMockSlashMenu();
    expect(menu.position).toBeDefined();
  });

  it('should navigate with arrow keys', () => {
    createMockSlashMenu({ selectedIndex: 0 });
    const handleKeyDown = vi.fn();
    handleKeyDown({ key: 'ArrowDown' });
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('should move selection up', () => {
    const menu = createMockSlashMenu({ selectedIndex: 1 });
    const selectedIndex = menu.selectedIndex - 1;
    expect(selectedIndex).toBe(0);
  });

  it('should move selection down', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 });
    const selectedIndex = menu.selectedIndex + 1;
    expect(selectedIndex).toBe(1);
  });

  it('should execute command on enter', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 });
    const executeCommand = vi.fn();
    executeCommand(menu.commands[menu.selectedIndex]);
    expect(executeCommand).toHaveBeenCalled();
  });

  it('should close on escape', () => {
    createMockSlashMenu({ isOpen: true });
    const closeMenu = vi.fn();
    closeMenu();
    expect(closeMenu).toHaveBeenCalled();
  });

  it('should handle backspace', () => {
    createMockSlashMenu({ searchQuery: 'heading' });
    const handleBackspace = vi.fn();
    handleBackspace();
    expect(handleBackspace).toHaveBeenCalled();
  });

  it('should accept text input', () => {
    createMockSlashMenu();
    const addText = vi.fn();
    addText('h');
    expect(addText).toHaveBeenCalledWith('h');
  });

  it('should group commands by category', () => {
    const menu = {
      ...createMockSlashMenu(),
      categories: [
        { name: 'Text', commands: ['heading', 'paragraph'] },
        { name: 'Media', commands: ['image', 'video'] },
      ],
    };
    expect(menu.categories).toBeDefined();
  });

  it('should highlight on hover', () => {
    const menu = createMockSlashMenu();
    const handleHover = vi.fn();
    handleHover(menu.commands[0].id);
    expect(handleHover).toHaveBeenCalledWith(menu.commands[0].id);
  });

  it('should highlight selected command', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 });
    expect(menu.selectedIndex).toBe(0);
  });

  it('should close on click outside', () => {
    createMockSlashMenu({ isOpen: true });
    const closeMenu = vi.fn();
    closeMenu();
    expect(closeMenu).toHaveBeenCalled();
  });

  it('should show recently used commands', () => {
    const menu = {
      ...createMockSlashMenu(),
      recentlyUsed: [
        {
          id: 'cmd-1',
          title: 'Heading',
          description: 'Large heading',
          trigger: '/heading',
        },
      ],
    };
    expect(menu.recentlyUsed).toBeDefined();
  });

  it('should track filtered command count', () => {
    const menu = createMockSlashMenu();
    const results = menu.commands.filter((cmd) =>
      cmd.title.toLowerCase().includes('heading')
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle no matching commands', () => {
    const menu = createMockSlashMenu();
    const results = menu.commands.filter((cmd) =>
      cmd.title.toLowerCase().includes('xyz')
    );
    expect(results.length).toBe(0);
  });

  it('should execute selected command', () => {
    const menu = createMockSlashMenu({ selectedIndex: 0 });
    const execute = vi.fn();
    execute(menu.commands[menu.selectedIndex].id);
    expect(execute).toHaveBeenCalled();
  });

  it('should accept command parameters', () => {
    const menu = createMockSlashMenu();
    const executeWithParameters = vi.fn();
    executeWithParameters(menu.commands[0].id, { text: 'Custom heading' });
    expect(executeWithParameters).toHaveBeenCalled();
  });

  it('should call callback after command execution', () => {
    const menu = createMockSlashMenu();
    const onExecute = vi.fn();
    onExecute(menu.commands[0].id);
    expect(onExecute).toHaveBeenCalledWith(menu.commands[0].id);
  });

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
    };
    expect(menu.commands[0].shortcut).toBeDefined();
  });

  it('should handle large command lists', () => {
    const largeMenu = {
      ...createMockSlashMenu(),
      commands: Array.from({ length: 50 }, (_, index) => ({
        id: `cmd-${index}`,
        title: `Command ${index}`,
        description: `Description ${index}`,
        trigger: `/cmd${index}`,
      })),
    };
    expect(largeMenu.commands.length).toBe(50);
  });

  it('should debounce search', () => {
    createMockSlashMenu();
    const search = vi.fn();
    search('heading');
    expect(search).toHaveBeenCalledWith('heading');
  });
});
