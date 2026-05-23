// Tuple Type
export type XY = {
  x: number;
  y: number;
}

// To bypass ts type check
export const defaultXY : XY = {x: -1, y: -1};

// Props for Generated boxes
export type GeneratedBoxProps = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
  key: string;
}

// Used in getCode to represent messages
export interface Message {
  id: string;
  // Assistant means message sent from chat bot
  role: 'user' | 'assistant';
  content: string;
}

// Determines block density in grid
export const numGridBlocksWide = 30;

// Determines height of grid (in vh)
export const numVHTall = 250;

