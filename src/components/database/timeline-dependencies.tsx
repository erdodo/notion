'use client';

import { useEffect, useState } from 'react';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline/standalone';

interface TimelineItem {
  id: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

interface TimelineDOM {
  center: HTMLElement;
}

interface TimelineInstance extends Timeline {
  dom: TimelineDOM;
  timeToPixel(time: number): number;
}

interface TimelineDependenciesProperties {
  timeline: TimelineInstance;
  items: DataSet<TimelineItem>;
  dependencies: { source: string; target: string }[];
}

export function TimelineDependencies({
  timeline,
  items,
  dependencies,
}: TimelineDependenciesProperties) {
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);

  useEffect(() => {
    if (!timeline) return;

    const updateLines = () => {
      const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

      for (const dep of dependencies) {
        const sourceItem = items.get(dep.source);
        const targetItem = items.get(dep.target);

        if (!sourceItem || !targetItem) continue;

        const sourceElement = timeline.dom.center.querySelector(
          `.vis-item[data-id="${dep.source}"]`
        ) as HTMLElement;
        const targetElement = timeline.dom.center.querySelector(
          `.vis-item[data-id="${dep.target}"]`
        ) as HTMLElement;

        if (sourceElement && targetElement) {
          const sourceRect = sourceElement.getBoundingClientRect();
          const tgtRect = targetElement.getBoundingClientRect();
          const containerRect = timeline.dom.center.getBoundingClientRect();

          const x1 = timeline.timeToPixel(sourceItem.end);
          const x2 = timeline.timeToPixel(targetItem.start);

          const y1 = sourceRect.top - containerRect.top + sourceRect.height / 2;
          const y2 = tgtRect.top - containerRect.top + tgtRect.height / 2;

          newLines.push({ x1, y1, x2, y2 });
        }
      }
      setLines(newLines);
    };

    timeline.on('changed', updateLines);
    timeline.on('rangechange', updateLines);

    const timer = setTimeout(updateLines, 100);

    return () => {
      timeline.off('changed', updateLines);
      timeline.off('rangechange', updateLines);
      clearTimeout(timer);
    };
  }, [timeline, items, dependencies]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible"
      style={{ zIndex: 0 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
        </marker>
      </defs>
      {lines.map((line, index) => {
        const dx = Math.abs(line.x2 - line.x1) / 2;
        const path = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;

        return (
          <path
            key={index}
            d={path}
            stroke="#888"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrowhead)"
            opacity="0.6"
          />
        );
      })}
    </svg>
  );
}
