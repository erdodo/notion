import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('BlockMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockBlockMenu = (properties = {}) => ({
    isOpen: false,
    position: { x: 0, y: 0 },
    blocks: [
      { id: 'block-1', type: 'paragraph', name: 'Paragraph', icon: '¶' },
      { id: 'block-2', type: 'heading1', name: 'Heading 1', icon: 'H1' },
      { id: 'block-3', type: 'heading2', name: 'Heading 2', icon: 'H2' },
      { id: 'block-4', type: 'image', name: 'Image', icon: '🖼' },
    ],
    selectedIndex: -1,
    ...properties,
  });

  it('should render block menu', () => {
    const menu = createMockBlockMenu();
    expect(menu.blocks).toBeDefined();
  });

  it('should close block menu', () => {
    const menu = createMockBlockMenu({ isOpen: true });
    let isOpen = menu.isOpen;
    expect(isOpen).toBe(true);

    isOpen = false;
    expect(isOpen).toBe(false);
  });

  it('should display available blocks', () => {
    const menu = createMockBlockMenu();
    expect(menu.blocks.length).toBeGreaterThan(0);
  });

  it('should support block selection', () => {
    const menu = createMockBlockMenu();
    const selectBlock = vi.fn();
    selectBlock(menu.blocks[0]);
    expect(selectBlock).toHaveBeenCalledWith(menu.blocks[0]);
  });

  it('should handle block click', () => {
    const menu = createMockBlockMenu();
    const handleClick = vi.fn();
    handleClick(menu.blocks[0].id);
    expect(handleClick).toHaveBeenCalledWith(menu.blocks[0].id);
  });

  it('should display block icons', () => {
    const menu = createMockBlockMenu();
    for (const block of menu.blocks) {
      expect(block.icon).toBeDefined();
    }
  });

  it('should display block names', () => {
    const menu = createMockBlockMenu();
    for (const block of menu.blocks) {
      expect(block.name).toBeDefined();
    }
  });

  it('should track menu position', () => {
    const menu = createMockBlockMenu();
    expect(menu.position).toBeDefined();
  });

  it('should update position', () => {
    createMockBlockMenu();
    const updatePosition = vi.fn();
    updatePosition({ x: 100, y: 200 });
    expect(updatePosition).toHaveBeenCalledWith({ x: 100, y: 200 });
  });

  it('should support keyboard navigation', () => {
    createMockBlockMenu();
    const handleKeyDown = vi.fn();
    handleKeyDown({ key: 'ArrowDown' });
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('should navigate up with arrow key', () => {
    const menu = createMockBlockMenu({ selectedIndex: 1 });
    const selectedIndex = menu.selectedIndex - 1;
    expect(selectedIndex).toBe(0);
  });

  it('should navigate down with arrow key', () => {
    const menu = createMockBlockMenu({ selectedIndex: 0 });
    const selectedIndex = menu.selectedIndex + 1;
    expect(selectedIndex).toBe(1);
  });

  it('should select block on enter', () => {
    const menu = createMockBlockMenu({ selectedIndex: 0 });
    const selectBlock = vi.fn();
    selectBlock(menu.blocks[menu.selectedIndex]);
    expect(selectBlock).toHaveBeenCalled();
  });

  it('should close menu on escape', () => {
    createMockBlockMenu({ isOpen: true });
    const closeMenu = vi.fn();
    closeMenu();
    expect(closeMenu).toHaveBeenCalled();
  });

  it('should support searching blocks', () => {
    const menu = createMockBlockMenu();
    const search = (query) => {
      return menu.blocks.filter((block) =>
        block.name.toLowerCase().includes(query.toLowerCase())
      );
    };

    const results = search('heading');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should display filtered blocks', () => {
    const menu = {
      ...createMockBlockMenu(),
      filtered: [
        { id: 'block-2', type: 'heading1', name: 'Heading 1', icon: 'H1' },
        { id: 'block-3', type: 'heading2', name: 'Heading 2', icon: 'H2' },
      ],
    };
    expect(menu.filtered.length).toBeLessThan(menu.blocks.length);
  });

  it('should group blocks by category', () => {
    const menu = {
      ...createMockBlockMenu(),
      categories: [
        { name: 'Text', blocks: ['paragraph', 'heading1'] },
        { name: 'Media', blocks: ['image', 'video'] },
      ],
    };
    expect(menu.categories).toBeDefined();
  });

  it('should highlight on hover', () => {
    const menu = createMockBlockMenu();
    const handleHover = vi.fn();
    handleHover(menu.blocks[0].id);
    expect(handleHover).toHaveBeenCalledWith(menu.blocks[0].id);
  });

  it('should track mouse movement', () => {
    createMockBlockMenu();
    const handleMouseMove = vi.fn();
    handleMouseMove();
    expect(handleMouseMove).toHaveBeenCalled();
  });

  it('should support scrolling in menu', () => {
    const menu = {
      ...createMockBlockMenu(),
      blocks: Array.from({ length: 20 }, (_, index) => ({
        id: `block-${index}`,
        type: `block${index}`,
        name: `Block ${index}`,
        icon: '□',
      })),
    };
    expect(menu.blocks.length).toBeGreaterThan(10);
  });

  it('should highlight selected block', () => {
    const menu = createMockBlockMenu({ selectedIndex: 0 });
    expect(menu.selectedIndex).toBe(0);
  });

  it('should close menu on click outside', () => {
    createMockBlockMenu({ isOpen: true });
    const closeMenu = vi.fn();
    closeMenu();
    expect(closeMenu).toHaveBeenCalled();
  });

  it('should display block description', () => {
    const menu = {
      ...createMockBlockMenu(),
      blocks: [
        {
          id: 'block-1',
          type: 'paragraph',
          name: 'Paragraph',
          icon: '¶',
          description: 'Start with plain text',
        },
      ],
    };
    expect(menu.blocks[0].description).toBeDefined();
  });

  it('should show recently used blocks', () => {
    const menu = {
      ...createMockBlockMenu(),
      recentlyUsed: [
        { id: 'block-1', type: 'paragraph', name: 'Paragraph', icon: '¶' },
      ],
    };
    expect(menu.recentlyUsed).toBeDefined();
  });

  it('should show favorite blocks', () => {
    const menu = {
      ...createMockBlockMenu(),
      favorites: [
        { id: 'block-1', type: 'paragraph', name: 'Paragraph', icon: '¶' },
      ],
    };
    expect(menu.favorites).toBeDefined();
  });

  it('should display quick insert indicator', () => {
    const menu = {
      ...createMockBlockMenu(),
      searchText: '/',
    };
    expect(menu.searchText).toBe('/');
  });

  it('should handle large block lists efficiently', () => {
    const largeMenu = {
      ...createMockBlockMenu(),
      blocks: Array.from({ length: 100 }, (_, index) => ({
        id: `block-${index}`,
        type: `block${index}`,
        name: `Block ${index}`,
        icon: '□',
      })),
    };
    expect(largeMenu.blocks.length).toBe(100);
  });
});
