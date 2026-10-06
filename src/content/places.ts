import type { MapPlaceId } from '@/models';

/** Approximate positions on the stylised story map (viewBox 400×300) – not exact geography. */
export const PLACES: Record<MapPlaceId, { x: number; y: number }> = {
  judi: { x: 272, y: 42 },
  mesopotamia: { x: 300, y: 112 },
  jerusalem: { x: 150, y: 108 },
  egypt: { x: 92, y: 150 },
  madinah: { x: 205, y: 198 },
  makkah: { x: 222, y: 246 },
};
