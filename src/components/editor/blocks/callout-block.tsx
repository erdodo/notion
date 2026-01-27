'use client';

import { createReactBlockSpec } from '@blocknote/react';

export const CalloutBlock = createReactBlockSpec(
  {
    type: 'callout',
    content: 'inline',
    propSchema: {
      type: {
        default: 'info',
        values: ['info', 'success', 'warning', 'error'],
      },
    },
  },
  {
    render: (properties) => {
      const { block } = properties;
      const type = block.props.type;

      const styles = {
        info: {
          color:
            'bg-gray-100 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800',
          icon: '💡',
        },
        success: {
          color:
            'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          icon: '✅',
        },
        warning: {
          color:
            'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          icon: '⚠️',
        },
        error: {
          color:
            'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          icon: '🚨',
        },
      };

      const currentStyle = styles[type] || styles.info;

      return (
        <div
          className={`flex p-4 rounded-lg border my-2 ${currentStyle.color}`}
        >
          <div className="mr-4 text-xl select-none" contentEditable={false}>
            {currentStyle.icon}
          </div>
          <div className="flex-1 min-w-0" ref={properties.contentRef} />
        </div>
      );
    },
  }
);
