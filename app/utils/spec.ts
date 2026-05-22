// Tuple Type
export type XY = {
  x: number;
  y: number;
}

// To bypass ts type check
export const defaultXY = {x: -1, y: -1};

// Props for Generated boxes
export type GeneratedBoxProps = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
}