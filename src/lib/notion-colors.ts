export const NOTION_COLORS = [
  {
    name: 'default',
    value: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-900',
    dot: 'bg-gray-500',
  },
  {
    name: 'gray',
    value: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-900',
    dot: 'bg-gray-500',
  },
  {
    name: 'brown',
    value: 'brown',
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    dot: 'bg-orange-500',
  },
  {
    name: 'orange',
    value: 'orange',
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    dot: 'bg-orange-500',
  },
  {
    name: 'yellow',
    value: 'yellow',
    bg: 'bg-yellow-100',
    text: 'text-yellow-900',
    dot: 'bg-yellow-500',
  },
  {
    name: 'green',
    value: 'green',
    bg: 'bg-green-100',
    text: 'text-green-900',
    dot: 'bg-green-500',
  },
  {
    name: 'blue',
    value: 'blue',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    dot: 'bg-blue-500',
  },
  {
    name: 'purple',
    value: 'purple',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    dot: 'bg-purple-500',
  },
  {
    name: 'pink',
    value: 'pink',
    bg: 'bg-pink-100',
    text: 'text-pink-900',
    dot: 'bg-pink-500',
  },
  {
    name: 'red',
    value: 'red',
    bg: 'bg-red-100',
    text: 'text-red-900',
    dot: 'bg-red-500',
  },
];

export function getOptionColors(colorValue: string) {
  return NOTION_COLORS.find((c) => c.value === colorValue) || NOTION_COLORS[0];
}
