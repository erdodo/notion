import Link from '@tiptap/extension-link';

// Extend Tiptap's Link extension for page references
export const PageLink = Link.extend({
  name: 'pageLink',

  addAttributes() {
    return {
      ...this.parent?.(),
      'data-page-id': {
        default: null,
        parseHTML: (element) => element.getAttribute('data-page-id'),
        renderHTML: (attributes) => {
          if (!attributes['data-page-id']) {
            return {};
          }
          return {
            'data-page-id': attributes['data-page-id'],
          };
        },
      },
    };
  },
});
