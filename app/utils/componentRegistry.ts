import { ComponentDef } from './spec';

// Seed registry of highly-customizable UI component types. Runtime-extendable
// (see addNewCompName / addNewCompSpec in SpatialGrid). This could be a research optimization target.
//
// Each `features` array is the component's CANONICAL, EXHAUSTIVE feature list — it
// names core/structural features (what the component fundamentally IS) alongside
// optional add-ons, because the generator builds exactly the ACTIVE features and
// nothing else. `genInstructions` is HOW/quality guidance that shapes those
// features; it must not introduce a feature that isn't also in `features`.
// `defaultActiveIdx` enables every core feature by default (a must-have is never
// left merely available).
export const COMPONENT_REGISTRY: ComponentDef[] = [
  {
    name: 'Kanban Board',
    genInstructions:
      'Build a multi-column kanban board organized by status. Keep it dense but readable, with clear visual separation between columns and compact cards.',
    features: [
      'Status Columns',
      'Column Headers With Counts',
      'Task Cards',
      'Draggable Cards',
      'Collapsible Columns',
      'Priority Tags',
      'Due Date Display',
      'Assignee Avatars',
      'Column Card Limits',
      'Add Card Button',
      'Color-coded Labels',
    ],
    defaultActiveIdx: [0, 1, 2, 3, 5, 7, 9],
  },
  {
    name: 'Data Table',
    genInstructions:
      'Build a data table with aligned columns and realistic sample rows. Use a "table-fixed w-full" table (never content-sized table-auto) and "truncate" long cell values so the table always fits its container width without horizontal overflow.',
    features: [
      'Header Row',
      'Data Rows',
      'Zebra Striping',
      'Sortable Columns',
      'Search Bar',
      'Row Selection Checkboxes',
      'Pagination',
      'Status Badges',
      'Row Actions Menu',
      'Sticky Header',
      'Column Resizing',
    ],
    defaultActiveIdx: [0, 1, 2, 3, 7, 9],
  },
  {
    name: 'Stat Dashboard',
    genInstructions:
      'Build a dashboard of KPI stat cards in a responsive grid. Keep each card scannable, with a clear hierarchy between label and value.',
    features: [
      'KPI Stat Cards',
      'Metric Labels',
      'Large Values',
      'Trend Arrows',
      'Sparkline Charts',
      'Comparison vs Last Period',
      'Icon Badges',
      'Color-coded Deltas',
      'Progress Bars',
      'Time Range Selector',
    ],
    defaultActiveIdx: [0, 1, 2, 3, 6, 7],
  },
  {
    name: 'Calendar',
    genInstructions:
      'Build a month-view calendar grid. Keep day cells even and legible, and make the current month read at a glance.',
    features: [
      'Month Grid',
      'Weekday Headers',
      'Day Cells',
      'Event Chips',
      'Today Highlight',
      'Multi-day Events',
      'Mini Month Navigator',
      'Week / Month Toggle',
      'Color-coded Categories',
      'Add Event Button',
    ],
    defaultActiveIdx: [0, 1, 2, 3, 4, 8],
  },
  {
    name: 'Chart Panel',
    genInstructions:
      'Build an analytics chart panel: a titled card containing a chart drawn with divs/SVG. Size the plot to fill the card and keep it legible at any container size.',
    features: [
      'Titled Card',
      'Chart Plot',
      'Legend',
      'Gridlines',
      'Axis Labels',
      'Tooltip on Hover',
      'Multiple Series',
      'Time Range Tabs',
      'Summary Stat Header',
    ],
    defaultActiveIdx: [0, 1, 2, 4, 8],
  },
  {
    name: 'Form',
    genInstructions:
      'Build a clean form card with a clear reading order and comfortable spacing between fields.',
    features: [
      'Form Card',
      'Labeled Inputs',
      'Submit Button',
      'Section Grouping',
      'Inline Validation Hints',
      'Required Field Markers',
      'Helper Text',
      'Two-column Layout',
      'Toggle Switches',
      'Cancel Button',
    ],
    defaultActiveIdx: [0, 1, 2, 5, 6],
  },
];
