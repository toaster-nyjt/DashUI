import { useMemo } from 'react';
import { CompSpec, DefaultCompSpec } from './spec';

// Seed registry of highly-customizable UI component types. Runtime-extendable
// (see addNewCompName / addNewCompSpec in SpatialGrid). "Research" refines this.
export const DEFAULT_SPEC: DefaultCompSpec[] = [
  {
    name: 'Kanban Board',
    genInstructions:
      'Build a multi-column kanban board organized by status. Use clear column headers with item counts, compact cards with titles, and subtle separators. Dense but readable.',
    spec: {
      specArr: [
        'Collapsible Columns',
        'Draggable Cards',
        'Priority Tags',
        'Due Date Display',
        'Assignee Avatars',
        'Column Card Limits',
        'Add Card Button',
        'Color-coded Labels',
      ],
      defaultSpecArrIdx: [2, 4, 6],
    },
  },
  {
    name: 'Data Table',
    genInstructions:
      'Build a data table with a header row, zebra striping, and aligned columns. Include realistic sample rows.',
    spec: {
      specArr: [
        'Sortable Columns',
        'Search Bar',
        'Row Selection Checkboxes',
        'Pagination',
        'Status Badges',
        'Row Actions Menu',
        'Sticky Header',
        'Column Resizing',
      ],
      defaultSpecArrIdx: [0, 4, 6],
    },
  },
  {
    name: 'Stat Dashboard',
    genInstructions:
      'Build a dashboard of KPI stat cards in a responsive grid. Each card has a label, a large value, and a trend indicator.',
    spec: {
      specArr: [
        'Trend Arrows',
        'Sparkline Charts',
        'Comparison vs Last Period',
        'Icon Badges',
        'Color-coded Deltas',
        'Progress Bars',
        'Time Range Selector',
      ],
      defaultSpecArrIdx: [0, 3, 4],
    },
  },
  {
    name: 'Calendar',
    genInstructions:
      'Build a month-view calendar grid with weekday headers and day cells containing event chips.',
    spec: {
      specArr: [
        'Event Chips',
        'Today Highlight',
        'Multi-day Events',
        'Mini Month Navigator',
        'Week / Month Toggle',
        'Color-coded Categories',
        'Add Event Button',
      ],
      defaultSpecArrIdx: [0, 1, 5],
    },
  },
  {
    name: 'Chart Panel',
    genInstructions:
      'Build an analytics chart panel: a titled card containing a chart drawn with divs/SVG, plus a legend.',
    spec: {
      specArr: [
        'Legend',
        'Gridlines',
        'Axis Labels',
        'Tooltip on Hover',
        'Multiple Series',
        'Time Range Tabs',
        'Summary Stat Header',
      ],
      defaultSpecArrIdx: [0, 2, 6],
    },
  },
  {
    name: 'Form',
    genInstructions:
      'Build a clean form card with labeled inputs, grouped sections, and a primary submit button.',
    spec: {
      specArr: [
        'Section Grouping',
        'Inline Validation Hints',
        'Required Field Markers',
        'Helper Text',
        'Two-column Layout',
        'Toggle Switches',
        'Submit + Cancel Buttons',
      ],
      defaultSpecArrIdx: [2, 3, 6],
    },
  },
];

// Pure: assemble the LLM instruction string from the current spec state.
export function buildInstructions(compSpec: CompSpec, defaultSpec: DefaultCompSpec[]): string {
  const def = defaultSpec.find((d) => d.name === compSpec.name);
  if (!def) return `Create a ${compSpec.name || 'component'}.`;

  const active = compSpec.specArrIdx
    .map((i) => def.spec.specArr[i])
    .filter(Boolean);

  // Every customization the user did NOT choose, to be explicitly excluded.
  const excluded = def.spec.specArr.filter((_, i) => !compSpec.specArrIdx.includes(i));

  let out = `Create a ${def.name}. ${def.genInstructions}`;
  if (active.length) out += ` Include these features: ${active.join('; ')}.`;
  if (excluded.length) out += ` Do NOT include the following features under any circumstances — they have been deliberately excluded and must not appear in any form: ${excluded.join('; ')}.`;
  return out;
}

// Thin hook over buildInstructions for components that render the live string.
export function useInstructionsFromState(compSpec: CompSpec, defaultSpec: DefaultCompSpec[]): string {
  return useMemo(() => buildInstructions(compSpec, defaultSpec), [compSpec, defaultSpec]);
}
