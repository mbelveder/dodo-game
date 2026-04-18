/**
 * Sprite loader: characters and furniture.
 *
 * Characters: 112×96 PNG, 3 direction rows (down, up, right) × 7 frames.
 * Frame layout in each row: walk-1, walk-2, walk-3, type-1, type-2, read-1, read-2.
 * Each frame is 16×32 (CHAR_W × CHAR_H).
 */
import { Direction } from './types';

export const CHAR_W = 16;
export const CHAR_H = 32;
export const CHAR_FRAMES_PER_ROW = 7;
export const CHAR_PALETTE_COUNT = 6;

export interface CharacterSheet {
  /** Source image, used with drawImage for sub-rect rendering */
  img: HTMLImageElement;
  /** Pre-rendered horizontally-flipped image for left-facing frames */
  imgFlipped: HTMLCanvasElement;
}

const charSheets: (CharacterSheet | null)[] = new Array(CHAR_PALETTE_COUNT).fill(null);
const furnitureImgs = new Map<string, HTMLImageElement>();
let assetsReady = false;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function flipHorizontal(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(img.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export async function loadCharacterSheets(): Promise<void> {
  for (let i = 0; i < CHAR_PALETTE_COUNT; i++) {
    const img = await loadImage(`/characters/char_${i}.png`);
    charSheets[i] = { img, imgFlipped: flipHorizontal(img) };
  }
}

export function getCharacterSheet(paletteIndex: number): CharacterSheet | null {
  return charSheets[paletteIndex % CHAR_PALETTE_COUNT];
}

/** Compute frame source rect for a character, given direction and frame index 0-6.
 *  Returns {sx, sy, sw, sh, source} where source is the right image to draw from. */
export interface CharFrameRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  source: CanvasImageSource;
}

export function getCharFrameRect(
  sheet: CharacterSheet,
  dir: Direction,
  frameIdx: number,
): CharFrameRect {
  // Direction rows: down=0, up=1, right=2 ; left = flipped right
  let row = 0;
  let useFlipped = false;
  switch (dir) {
    case Direction.DOWN:
      row = 0;
      break;
    case Direction.UP:
      row = 1;
      break;
    case Direction.RIGHT:
      row = 2;
      break;
    case Direction.LEFT:
      row = 2;
      useFlipped = true;
      break;
  }
  const source = useFlipped ? sheet.imgFlipped : sheet.img;
  const totalRowW = CHAR_FRAMES_PER_ROW * CHAR_W;
  // For flipped image, frame indexes are mirrored around the row width
  const sxBase = frameIdx * CHAR_W;
  const sx = useFlipped ? totalRowW - sxBase - CHAR_W : sxBase;
  return { sx, sy: row * CHAR_H, sw: CHAR_W, sh: CHAR_H, source };
}

/** Frame index for walk animation (4-step cycle: 0, 1, 2, 1) */
export function walkFrameIdx(frame: number): number {
  const cycle = [0, 1, 2, 1];
  return cycle[frame % 4];
}

/** Frame index for typing (alternates frames 3 and 4) */
export function typeFrameIdx(frame: number): number {
  return 3 + (frame % 2);
}

// ── Furniture ──────────────────────────────────────────────────

export async function loadFurnitureImages(srcs: string[]): Promise<void> {
  for (const src of srcs) {
    if (furnitureImgs.has(src)) continue;
    const img = await loadImage(src);
    furnitureImgs.set(src, img);
  }
}

export function getFurnitureImage(src: string): HTMLImageElement | null {
  return furnitureImgs.get(src) ?? null;
}

export function setAssetsReady(): void {
  assetsReady = true;
}

export function isAssetsReady(): boolean {
  return assetsReady;
}
