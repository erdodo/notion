import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useDocumentsStore } from '@/store/use-documents-store';

describe('useDocumentsStore - WebSocket Integration Tests', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useDocumentsStore());
    result.current.setDocuments([]);
    result.current.setRecentPages([]);
    result.current.setFavoritePages([]);
    result.current.setPublishedPages([]);
    result.current.setSharedPages([]);
    result.current.setTrashPages([]);
  });

  describe('Document Updates Across All Lists', () => {
    it('should update document title in all lists when updateDocument is called', () => {
      const { result } = renderHook(() => useDocumentsStore());

      const document_ = {
        id: 'doc-1',
        title: 'Original',
        isArchived: false,
        isPublished: false,
        parentId: null,
      };

      result.current.setDocuments([document_]);
      result.current.setRecentPages([document_]);
      result.current.setFavoritePages([document_]);
      result.current.setSharedPages([document_]);

      result.current.updateDocument('doc-1', { title: 'Updated' });

      expect(result.current.documents[0].title).toBe('Updated');
      expect(result.current.recentPages[0].title).toBe('Updated');
      expect(result.current.favoritePages[0].title).toBe('Updated');
      expect(result.current.sharedPages[0].title).toBe('Updated');
    });

    it('should update document icon in all lists including sharedPages', () => {
      const { result } = renderHook(() => useDocumentsStore());

      const document_ = {
        id: 'doc-1',
        title: 'Document',
        icon: '📄',
        isArchived: false,
        isPublished: false,
        parentId: null,
      };

      result.current.setDocuments([document_]);
      result.current.setSharedPages([document_]);
      result.current.setPublishedPages([document_]);

      result.current.updateDocument('doc-1', { icon: '🚀' });

      expect(result.current.documents[0].icon).toBe('🚀');
      expect(result.current.sharedPages[0].icon).toBe('🚀');
      expect(result.current.publishedPages[0].icon).toBe('🚀');
    });
  });

  describe('Document Archiving', () => {
    it('should remove document from all lists and add to trash when archived', () => {
      const { result } = renderHook(() => useDocumentsStore());

      const document_ = {
        id: 'doc-1',
        title: 'Document',
        isArchived: false,
        isPublished: false,
        parentId: null,
      };

      result.current.setDocuments([document_]);
      result.current.setRecentPages([document_]);
      result.current.setFavoritePages([document_]);
      result.current.setSharedPages([document_]);

      result.current.archiveDocument('doc-1');

      expect(result.current.documents).toHaveLength(0);
      expect(result.current.recentPages).toHaveLength(0);
      expect(result.current.favoritePages).toHaveLength(0);
      expect(result.current.sharedPages).toHaveLength(0);

      expect(result.current.trashPages).toHaveLength(1);
      expect(result.current.trashPages[0].isArchived).toBe(true);
    });
  });

  describe('Document Deletion', () => {
    it('should remove document from all lists when deleted', () => {
      const { result } = renderHook(() => useDocumentsStore());

      const document_ = {
        id: 'doc-1',
        title: 'Document',
        isArchived: false,
        isPublished: false,
        parentId: null,
      };

      result.current.setDocuments([document_]);
      result.current.setRecentPages([document_]);
      result.current.setFavoritePages([document_]);
      result.current.setPublishedPages([document_]);
      result.current.setSharedPages([document_]);
      result.current.setTrashPages([document_]);

      result.current.removeDocument('doc-1');

      expect(result.current.documents).toHaveLength(0);
      expect(result.current.recentPages).toHaveLength(0);
      expect(result.current.favoritePages).toHaveLength(0);
      expect(result.current.publishedPages).toHaveLength(0);
      expect(result.current.sharedPages).toHaveLength(0);
      expect(result.current.trashPages).toHaveLength(0);
    });
  });

  describe('Nested Document Updates', () => {
    it('should update nested documents correctly', () => {
      const { result } = renderHook(() => useDocumentsStore());

      const parent = {
        id: 'parent',
        title: 'Parent',
        isArchived: false,
        isPublished: false,
        parentId: null,
        children: [
          {
            id: 'child',
            title: 'Child',
            isArchived: false,
            isPublished: false,
            parentId: 'parent',
          },
        ],
      };

      result.current.setDocuments([parent]);
      result.current.updateDocument('child', { title: 'Updated Child' });

      expect(result.current.documents[0].children![0].title).toBe(
        'Updated Child'
      );
    });

    it('should remove nested documents correctly', () => {
      const { result } = renderHook(() => useDocumentsStore());

      const parent = {
        id: 'parent',
        title: 'Parent',
        isArchived: false,
        isPublished: false,
        parentId: null,
        children: [
          {
            id: 'child-1',
            title: 'Child 1',
            isArchived: false,
            isPublished: false,
            parentId: 'parent',
          },
          {
            id: 'child-2',
            title: 'Child 2',
            isArchived: false,
            isPublished: false,
            parentId: 'parent',
          },
        ],
      };

      result.current.setDocuments([parent]);
      result.current.removeDocument('child-1');

      expect(result.current.documents[0].children).toHaveLength(1);
      expect(result.current.documents[0].children![0].id).toBe('child-2');
    });
  });
});
