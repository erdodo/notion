import { describe, it, expect } from 'vitest';
import { DragDropManager } from '../drag-drop-manager';

describe('Drag and Drop Functionality', () => {
  it('should have DragDropManager component', () => {
    expect(DragDropManager).toBeDefined();
    expect(typeof DragDropManager).toBe('function');
  });

  it('should accept editor prop', () => {
    const result = DragDropManager({ _editor: null });
    expect(result).toBeDefined();
  });

  it('should accept documentId prop', () => {
    const result = DragDropManager({ _editor: null, _documentId: 'test-123' });
    expect(result).toBeDefined();
  });
});
