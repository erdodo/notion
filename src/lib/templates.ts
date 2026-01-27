export const TEMPLATES = [
  {
    id: 'meeting-notes',
    label: 'Meeting Notes',
    icon: '📝',
    content: [
      {
        type: 'heading',
        props: { level: 1 },
        content: 'Meeting Notes',
      },
      {
        type: 'paragraph',
        content: 'Date: ' + new Date().toLocaleDateString(),
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Attendees',
      },
      {
        type: 'bulletListItem',
        content: ' ',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Agenda',
      },
      {
        type: 'numberedListItem',
        content: 'Topic 1',
      },
      {
        type: 'numberedListItem',
        content: 'Topic 2',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Action Items',
      },
      {
        type: 'checkListItem',
        content: ' ',
      },
    ],
  },
  {
    id: 'project-plan',
    label: 'Project Plan',
    icon: '🚀',
    content: [
      {
        type: 'heading',
        props: { level: 1 },
        content: 'Project Plan',
      },
      {
        type: 'callout',
        props: { type: 'info' },
        content:
          'Objective: Define the scope, timeline, and resources for the project.',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Overview',
      },
      {
        type: 'paragraph',
        content: 'Brief description of the project...',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Goals',
      },
      {
        type: 'bulletListItem',
        content: 'Goal 1',
      },
      {
        type: 'bulletListItem',
        content: 'Goal 2',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Milestones',
      },
      {
        type: 'table',
        content: {
          type: 'tableContent',
          rows: [
            { cells: ['Phase', 'Deliverable', 'Date'] },
            { cells: ['Phase 1', 'Prototype', 'TBD'] },
            { cells: ['Phase 2', 'Launch', 'TBD'] },
          ],
        },
      },
    ],
  },
  {
    id: 'journal',
    label: 'Personal Journal',
    icon: '📔',
    content: [
      {
        type: 'heading',
        props: { level: 1 },
        content: 'Daily Journal',
      },
      {
        type: 'paragraph',
        content: new Date().toLocaleDateString(),
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Mood',
      },
      {
        type: 'paragraph',
        content: 'How are you feeling today?',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Highlights',
      },
      {
        type: 'bulletListItem',
        content: ' ',
      },
      {
        type: 'heading',
        props: { level: 2 },
        content: 'Reflections',
      },
      {
        type: 'paragraph',
        content: ' ',
      },
    ],
  },
];
