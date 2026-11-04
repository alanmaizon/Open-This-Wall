export type Scalar = number;

export type Point = {
  x: number;
  y: number;
  z?: number;
  frame?: string;
};

export type Vector = {
  x: number;
  y: number;
  z?: number;
  frame?: string;
};

export type Plane = {
  normal: Vector;
  offset: number;
  frame?: string;
};

export const add = (a: Point, b: Vector): Point => ({
  x: a.x + b.x, y: a.y + b.y, z: (a.z ?? 0) + (b.z ?? 0), frame: a.frame,
});

export const subtract = (a: Point, b: Point): Vector => ({
  x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0), frame: a.frame,
});

export const scale = (v: Vector, k: number): Vector => ({
  x: v.x * k, y: v.y * k, z: (v.z ?? 0) * k, frame: v.frame,
});

export const magnitude = (v: Vector): number => Math.hypot(v.x, v.y, v.z ?? 0);

export const normalize = (v: Vector): Vector => {
  const m = magnitude(v);
  return m === 0 ? { x: 0, y: 0, z: 0, frame: v.frame } : scale(v, 1 / m);
};

export const dot = (a: Vector, b: Vector): number => a.x * b.x + a.y * b.y + (a.z ?? 0) * (b.z ?? 0);
