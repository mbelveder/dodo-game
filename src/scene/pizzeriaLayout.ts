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

  // Big communal table in the middle of the dining room. Diners sit on
  // three sides — north, west, east — and the south side (closest to the
  // viewer) is left open. There's a fresh pizza on the table.
  // TABLE_FRONT = 3 cols × 4 rows footprint, top row decorative.
  // SOFA_FRONT spans 2 tiles north of the table; SOFA_SIDE flanks east and
  // west. The side sofas are mirrored so their back-rest faces AWAY from
  // the table (so a seated diner faces inward toward the food).
  place('SOFA_FRONT', 11, 14),
  place('SOFA_SIDE', 10, 16),       // west sofa: back faces west (away)
  place('SOFA_SIDE', 14, 16, true), // east sofa: back faces east (away — mirrored)
  place('TABLE_FRONT', 11, 15),
  place('PIZZA', 11, 17),

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
  // Courier-style station near the whiteboard — covers delivery time +
  // 60-minute promise.
  { id: 'dispatch', col: 2, row: 18, label: 'Доставка' },
  // Regions chart sits on the big communal table — placed above the
  // table on the right (north-east corner) so the player can approach
  // from the open dining floor north or east of the table.
  { id: 'regions', col: 14, row: 14, label: 'Карта России' },
];

// ── Characters ─────────────────────────────────────────────────────

// Palette index → character sprite sheet:
//   0 boy with tie     1 blonde with apron     2 person with afro (orange)
//   3 older with white hair (suit)     4 boy without tie     5 person with red dress
// Six unique palettes for six characters.
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
  // Vika (manager) — palette 1 (blonde girl), in back office
  createCharacter({
    id: 'vika',
    paletteIndex: 1,
    col: 17,
    row: 3,
    name: 'Вика',
    dir: Direction.DOWN,
    wanders: true,
    wanderRadius: 3,
  }),
  // Pizzaiolo (Andrey) — palette 3, near oven
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

  // ── Three diners seated on sofas around the big communal table ────
  // The big table is at cols 11–13, rows 15–18 (south side closest to
  // viewer is empty). Each diner is from a different federal district
  // and is placed sitting on a sofa.

  // North side — Far East (Дальневосточный ФО). Sits on the north sofa
  // (col 12, row 14). The sofa is rendered with a +8 px y-offset so it
  // hugs the table, and the seated drop pulls the diner forward so he
  // looks like he's leaning over the food.
  createCharacter({
    id: 'diner_far_east',
    paletteIndex: 0,
    col: 12,
    row: 14,
    name: 'Гость из Владивостока',
    dir: Direction.DOWN,
    wanders: false,
    seated: true,
  }),
  // West side — Volga (Приволжский ФО) — palette 2 (afro orange) so Vika
  // and Volga don't share the blonde sprite.
  createCharacter({
    id: 'diner_volga',
    paletteIndex: 2,
    col: 10,
    row: 16,
    name: 'Гость из Казани',
    dir: Direction.RIGHT,
    wanders: false,
    seated: true,
  }),
  // East side — Siberia (Сибирский ФО)
  createCharacter({
    id: 'diner_siberia',
    paletteIndex: 5,
    col: 14,
    row: 16,
    name: 'Гость из Новосибирска',
    dir: Direction.LEFT,
    wanders: false,
    seated: true,
  }),

  // Courier — palette 1 (blonde with apron-like uniform), with a big
  // delivery backpack. Stationed in the dispatch corner near the
  // whiteboard. Volga diner shares the palette but they're far apart.
  createCharacter({
    id: 'courier',
    paletteIndex: 1,
    col: 4,
    row: 17,
    name: 'Дима-курьер',
    dir: Direction.DOWN,
    wanders: true,
    wanderRadius: 3,
    hasBackpack: true,
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
