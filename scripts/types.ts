export type Zone = {
  name: string;
  topl_y: number;
  topl_x: number;
  bright_y: number;
  bright_x: number;
  orig_y: number;
  orig_x: number;
};

export type ZonePoint = {
  zone: string;
  point: Point;
};

export type Point = {
  x: number;
  y: number;
};
