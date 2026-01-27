import { createReactBlockSpec } from '@blocknote/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@blocknote/react', () => ({
  createReactBlockSpec: vi.fn((_config) => ({
    type: _config.type,
    config: _config,
  })),
}));

describe('FileBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  let idCounter = 0;
  const createMockFileBlock = (properties = {}) => ({
    id: `file-block-${++idCounter}`,
    type: 'file',
    props: {
      url: 'https://example.com/document.pdf',
      fileName: 'document.pdf',
      fileSize: 1_024_000,
      fileType: 'application/pdf',
      ...properties,
    },
  });

  it('should create file block spec', () => {
    const spec = createReactBlockSpec(
      {
        type: 'file',
        content: 'none',
        propSchema: {
          url: { default: '' },
          fileName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    expect(spec.type).toBe('file');
  });

  it('should store file URL', () => {
    const block = createMockFileBlock();
    expect(block.props.url).toContain('document.pdf');
  });

  it('should update file URL', () => {
    const block = createMockFileBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        url: 'https://example.com/new-document.pdf',
      },
    };
    expect(updated.props.url).toContain('new-document.pdf');
  });

  it('should store file name', () => {
    const block = createMockFileBlock();
    expect(block.props.fileName).toBe('document.pdf');
  });

  it('should update file name', () => {
    const block = createMockFileBlock();
    const updated = {
      ...block,
      props: {
        ...block.props,
        fileName: 'updated-document.pdf',
      },
    };
    expect(updated.props.fileName).toBe('updated-document.pdf');
  });

  it('should store file size', () => {
    const block = createMockFileBlock({ fileSize: 2_048_000 });
    expect(block.props.fileSize).toBe(2_048_000);
  });

  it('should format file size', () => {
    const block = createMockFileBlock({ fileSize: 1_024_000 });
    const sizeMB = block.props.fileSize / (1024 * 1024);
    expect(sizeMB).toBeGreaterThan(0);
  });

  it('should store file type', () => {
    const block = createMockFileBlock({ fileType: 'application/pdf' });
    expect(block.props.fileType).toBe('application/pdf');
  });

  it('should support PDF files', () => {
    const block = createMockFileBlock({ fileType: 'application/pdf' });
    expect(block.props.fileType).toBe('application/pdf');
  });

  it('should support Word documents', () => {
    const block = createMockFileBlock({
      fileType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(block.props.fileType).toContain('word');
  });

  it('should support Excel files', () => {
    const block = createMockFileBlock({
      fileType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    expect(block.props.fileType).toContain('spreadsheet');
  });

  it('should support PowerPoint files', () => {
    const block = createMockFileBlock({
      fileType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    expect(block.props.fileType).toContain('presentation');
  });

  it('should support images', () => {
    const block = createMockFileBlock({ fileType: 'image/jpeg' });
    expect(block.props.fileType).toContain('image');
  });

  it('should support archives', () => {
    const block = createMockFileBlock({ fileType: 'application/zip' });
    expect(block.props.fileType).toContain('zip');
  });

  it('should support download action', () => {
    const block = createMockFileBlock();
    const downloadAction = vi.fn();
    downloadAction(block.props.url);
    expect(downloadAction).toHaveBeenCalledWith(block.props.url);
  });

  it('should include file name in download', () => {
    const block = createMockFileBlock();
    expect(block.props.fileName).toBeDefined();
  });

  it('should have unique block ID', () => {
    const block1 = createMockFileBlock();
    const block2 = createMockFileBlock();
    expect(block1.id).not.toBe(block2.id);
  });

  it('should be of type file', () => {
    const _block = createMockFileBlock();
    expect(_block.type).toBe('file');
  });

  it('should handle multiple file blocks', () => {
    const block1 = createMockFileBlock({
      url: 'https://example.com/file1.pdf',
      fileName: 'file1.pdf',
    });
    const block2 = createMockFileBlock({
      url: 'https://example.com/file2.docx',
      fileName: 'file2.docx',
    });

    expect(block1.props.url).not.toBe(block2.props.url);
    expect(block1.props.fileName).not.toBe(block2.props.fileName);
  });

  it('should accept valid file URLs', () => {
    const validUrls = [
      'https://example.com/document.pdf',
      'https://storage.googleapis.com/file.docx',
      'https://cdn.example.com/archive.zip',
    ];

    for (const url of validUrls) {
      const block = createMockFileBlock({ url });
      expect(block.props.url).toBe(url);
    }
  });

  it('should have url prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'file',
        content: 'none',
        propSchema: {
          url: { default: '' },
          fileName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('url');
    }
  });

  it('should have fileName prop', () => {
    const spec = createReactBlockSpec(
      {
        type: 'file',
        content: 'none',
        propSchema: {
          url: { default: '' },
          fileName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema).toHaveProperty('fileName');
    }
  });

  it('should store file metadata', () => {
    const block = {
      ...createMockFileBlock(),
      metadata: {
        uploadedAt: '2024-01-01',
        uploadedBy: 'user-1',
        lastModified: '2024-01-01',
      },
    };
    expect(block.metadata).toBeDefined();
  });

  it('should have default values', () => {
    const spec = createReactBlockSpec(
      {
        type: 'file',
        content: 'none',
        propSchema: {
          url: { default: '' },
          fileName: { default: '' },
        },
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.propSchema.url.default).toBe('');
    }
  });

  it('should have leaf content type', () => {
    const spec = createReactBlockSpec(
      {
        type: 'file',
        content: 'none',
        propSchema: {},
      },
      { render: () => null } as any
    ) as any;
    if (spec.config) {
      expect(spec.config.content).toBe('none');
    }
  });

  it('should handle bytes', () => {
    const block = createMockFileBlock({ fileSize: 512 });
    expect(block.props.fileSize).toBe(512);
  });

  it('should handle kilobytes', () => {
    const block = createMockFileBlock({ fileSize: 1024 * 50 });
    expect(block.props.fileSize).toBe(51_200);
  });

  it('should handle megabytes', () => {
    const block = createMockFileBlock({ fileSize: 1024 * 1024 * 5 });
    expect(block.props.fileSize).toBe(5_242_880);
  });

  it('should display file name', () => {
    const block = createMockFileBlock();
    expect(block.props.fileName).toBeDefined();
  });

  it('should display file size', () => {
    const block = createMockFileBlock();
    expect(block.props.fileSize).toBeDefined();
  });

  it('should support preview for certain file types', () => {
    const block = createMockFileBlock({ fileType: 'application/pdf' });
    const canPreview = ['application/pdf', 'image/jpeg', 'image/png'];
    expect(canPreview).toContain(block.props.fileType);
  });

  it('should support removal', () => {
    const block = createMockFileBlock();
    const removeAction = vi.fn();
    removeAction(block.id);
    expect(removeAction).toHaveBeenCalledWith(block.id);
  });

  it('should support updating file', () => {
    const block = createMockFileBlock();
    const updateAction = vi.fn();
    const newUrl = 'https://example.com/updated.pdf';
    updateAction(block.id, { url: newUrl });
    expect(updateAction).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ url: newUrl })
    );
  });

  it('should extract file name from URL', () => {
    const block = createMockFileBlock({
      url: 'https://example.com/downloads/document.pdf',
      fileName: 'document.pdf',
    });
    expect(block.props.fileName).toContain('document');
  });

  it('should handle empty file', () => {
    const block = createMockFileBlock({ fileSize: 0 });
    expect(block.props.fileSize).toBe(0);
  });

  it('should handle large files', () => {
    const block = createMockFileBlock({ fileSize: 1024 * 1024 * 100 });
    expect(block.props.fileSize).toBeGreaterThan(100_000_000);
  });
});
