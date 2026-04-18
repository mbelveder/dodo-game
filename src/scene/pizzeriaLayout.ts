import { createCharacter } from '../engine/character';
import { createGameState, type GameState } from '../engine/gameState';
import {
  Direction,
  TileType,
  type Interactable,
  type PlacedFurniture,
} from '../engine/types';

/**
 * Pizzeria layout. 30 cols × 20 rows, single open room with floor-color zones.
 *
 * Tile codes:
 *   '#' wall, '.' kitchen floor, ',' dining floor, ':' counter (dark), '~' carpet (red welcome mat), ' ' void
 *
 * Zones:
 *   Top-left: kitchen (oven, dough table, prep — all map to interactables)
 *   Middle band (row 9): counter + cash register
 *   Right: dining hall with tables
 *   Bottom-left: dispatch corner with whiteboard
 *   Top-right small cubby: back office (Vika's desk)
 */

const ROWS = [
  '##############################', // 0
  '#............#:::::::#,,,,,,,#', // 1  (kitchen | back office | dining)
  '#............#:::::::#,,,,,,,#', // 2
  '#............#.......#,,,,,,,#', // 3
  '#............#.......#,,,,,,,#', // 4
  '#............#.......#########', // 5
  '#............#.......,,,,,,,,#', // 6
  '#............#.......,,,,,,,,#', // 7
  '#............#.......,,,,,,,,#', // 8
  '#............:::::::::,,,,,,,#', // 9  (counter band)
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 10
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 11
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 12
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 13
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 14
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 15
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 16
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 17
  '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,#', // 18
  '##############################', // 19
];

function decode(rows: string[]): TileType[][] {
  return rows.map((rowStr) =>
    rowStr.split('').map((ch) => {
      switch (ch) {
        case '#':
          return TileType.WALL;
        case '.':
          return TileType.KITCHEN;
        case ',':
          return TileType.DINING;
        case ':':
          return TileType.COUNTER;
        case '~':
          return TileType.CARPET;
        case ' ':
          return TileType.VOID;
        default:
          return TileType.DINING;
      }
    }),
  );
}

const tileMap = decode(ROWS);
const COLS = ROWS[0].length;
const NROWS = ROWS.length;

// ── Furniture ──────────────────────────────────────────────────

let nextUid = 1;
function place(defId: string, col: number, row: number, mirror = false): PlacedFurniture {
  return { uid: `f${nextUid++}`, defId, col, row, mirror };
}

const furniture: PlacedFurniture[] = [
  // Kitchen: cols 1-12, rows 1-8. Place stations along the wall.
  // Row 1-2 (back wall area): oven (use TABLE_FRONT proxy), dough table, prep table.
  place('TABLE_FRONT', 2, 1), // ПЕЧЬ — оven station (3w x 4h, top row decorative)
  place('TABLE_FRONT', 7, 1), // ТЕСТО — dough table
  // Side stations
  place('SMALL_TABLE_FRONT', 2, 6), // ИНГРИДИЕНТЫ — small prep table
  place('SMALL_TABLE_FRONT', 7, 6), // САЛАТЫ / sauces

  // Counter row (row 9): cash register PC at counter
  place('PC_FRONT', 17, 8),

  // Back office (cols 14-20, rows 1-4): Vika's desk
  place('TABLE_FRONT', 14, 1), // Vika's desk
  place('PC_FRONT', 16, 1), // Computer on desk (will overlap visually — fine)
  place('CUSHIONED_CHAIR_BACK', 15, 4),
  place('CACTUS', 19, 1),
  place('CLOCK', 18, 1),

  // Dining tables (right + bottom-right area)
  // Table 1
  place('SMALL_TABLE_FRONT', 22, 2),
  place('WOODEN_CHAIR_FRONT', 22, 4),
  place('WOODEN_CHAIR_FRONT', 23, 4),

  // Table 2
  place('SMALL_TABLE_FRONT', 22, 7),
  place('WOODEN_CHAIR_FRONT', 22, 9),
  place('WOODEN_CHAIR_FRONT', 23, 9),

  // Bottom dining cluster
  place('SMALL_TABLE_FRONT', 4, 12),
  place('WOODEN_CHAIR_FRONT', 4, 14),
  place('WOODEN_CHAIR_FRONT', 5, 14),

  place('SMALL_TABLE_FRONT', 19, 12),
  place('WOODEN_CHAIR_FRONT', 19, 14),
  place('WOODEN_CHAIR_FRONT', 20, 14),

  place('SMALL_TABLE_FRONT', 24, 12),
  place('WOODEN_CHAIR_FRONT', 24, 14),
  place('WOODEN_CHAIR_FRONT', 25, 14),

  // Big communal table in the middle of the dining room with three chairs
  // above it (party seating). TABLE_FRONT = 3 cols × 4 rows footprint.
  place('WOODEN_CHAIR_BACK', 11, 14),
  place('WOODEN_CHAIR_BACK', 12, 14),
  place('WOODEN_CHAIR_BACK', 13, 14),
  place('TABLE_FRONT', 11, 15),

  // Dispatch corner (bottom-left) — whiteboard with delivery info
  place('WHITEBOARD', 1, 16),

  // Decor — plants scattered around to make the room feel lived-in
  place('PLANT', 27, 17),
  place('PLANT', 1, 11),
  place('PLANT', 27, 6),
  place('PLANT', 12, 11),
  place('PLANT', 22, 16),
  place('PLANT', 6, 17),
  place('CACTUS', 17, 16),
  place('BIN', 27, 18),
  place('COFFEE', 11, 1),
];

// ── Interactables (stations) ──────────────────────────────────────

const interactables: Interactable[] = [
  { id: 'oven', col: 3, row: 4, label: 'Печь' },
  { id: 'dough', col: 8, row: 4, label: 'Тесто' },
  { id: 'ingredients', col: 3, row: 8, label: 'Ингредиенты' },
  { id: 'sauces', col: 8, row: 8, label: 'Соусы' },
  { id: 'register', col: 17, row: 10, label: 'Касса' },
  { id: 'dispatch', col: 2, row: 18, label: 'Доставка' },
];

// ── Characters ─────────────────────────────────────────────────────

// Palette index → character sprite sheet:
//   0 boy with tie     1 blonde with apron     2 person with afro (orange)
//   3 older with white hair (suit)     4 boy without tie     5 person with red dress
// Each character gets a unique palette so no two look the same.
const characters = [
  // Sasha (player) — palette 4 (the guy without a tie)
  createCharacter({
    id: 'sasha',
    paletteIndex: 4,
    col: 14,
    row: 11,
    isPlayer: true,
    name: 'Саша',
    dir: Direction.UP,
  }),
  // Vika (manager) — palette 2, in back office
  createCharacter({
    id: 'vika',
    paletteIndex: 2,
    col: 17,
    row: 3,
    name: 'Вика',
    dir: Direction.DOWN,
    wanders: true,
    wanderRadius: 3,
  }),
  // Pizzaiolo 1 (Andrey) — palette 3, near oven
  createCharacter({
    id: 'pizzaiolo_1',
    paletteIndex: 3,
    col: 4,
    row: 5,
    name: 'Андрей',
    dir: Direction.UP,
    wanders: true,
    wanderRadius: 4,
  }),
  // Pizzaiolo 2 (Liza) — palette 1 (blonde with apron, fits the role)
  createCharacter({
    id: 'pizzaiolo_2',
    paletteIndex: 1,
    col: 9,
    row: 5,
    name: 'Лиза',
    dir: Direction.UP,
    wanders: true,
    wanderRadius: 4,
  }),
  // Courier (Dima) — palette 5
  createCharacter({
    id: 'courier',
    paletteIndex: 5,
    col: 4,
    row: 17,
    name: 'Дима-курьер',
    dir: Direction.UP,
    wanders: true,
    wanderRadius: 5,
  }),
  // Visitor — palette 0 (the only one left). One visitor only — no duplicates.
  createCharacter({
    id: 'visitor_1',
    paletteIndex: 0,
    col: 23,
    row: 5,
    name: 'Гость',
    dir: Direction.LEFT,
    wanders: true,
    wanderRadius: 4,
  }),
];

export function buildPizzeriaState(): GameState {
  return createGameState({
    cols: COLS,
    rows: NROWS,
    tileMap,
    furniture,
    characters,
    interactables,
  });
}

export const PIZZERIA_DIMENSIONS = { cols: COLS, rows: NROWS };
