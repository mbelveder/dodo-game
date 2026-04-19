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

// Cash booth: walls surround cols 15-20 rows 1-8, with a single entry tile
// at col 19 row 9 (the rest of the booth's south side is walled off, while
// the bits of the counter band outside the booth — col 13 west of it — stay
// as a regular counter strip for visual continuity).
const ROWS = [
  '##############################', // 0
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 1  (single open dining hall + cash booth)
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 2
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 3
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 4
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 5
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 6
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 7
  '#,,,,,,,,,,,,,#,,,,,,#,,,,,,,#', // 8
  '#,,,,,,,,,,,,:#####:##,,,,,,,#', // 9  (booth south wall, entry at col 19)
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
  // ── Upper-left big tables (oven + dough stations) ────────────────
  // Each big table now has SOFA_SIDE flanking east and west so the
  // "every big table has sofas" rule holds. North impossible (room
  // wall), south kept clear so the player can approach the
  // station's interactable tile from the south.
  place('TABLE_FRONT', 2, 1), // ПЕЧЬ
  place('SOFA_SIDE', 1, 2),       // oven west sofa
  place('SOFA_SIDE', 5, 2, true), // oven east sofa (mirrored — back away)

  place('TABLE_FRONT', 7, 1), // ТЕСТО
  place('SOFA_SIDE', 6, 2),        // dough west sofa
  place('SOFA_SIDE', 10, 2, true), // dough east sofa

  // Side stations (small prep tables) — chairs on north + south sides
  // like the rest of the small tables. The interactable tiles at
  // (3, 8) and (8, 8) are reachable through the south-chair top tile.
  place('SMALL_TABLE_FRONT', 2, 6), // ИНГРИДИЕНТЫ
  place('WOODEN_CHAIR_BACK', 2, 5),
  place('WOODEN_CHAIR_BACK', 3, 5),
  place('WOODEN_CHAIR_FRONT', 2, 8),
  place('WOODEN_CHAIR_FRONT', 3, 8),

  place('SMALL_TABLE_FRONT', 7, 6), // САЛАТЫ / sauces
  place('WOODEN_CHAIR_BACK', 7, 5),
  place('WOODEN_CHAIR_BACK', 8, 5),
  place('WOODEN_CHAIR_FRONT', 7, 8),
  place('WOODEN_CHAIR_FRONT', 8, 8),

  // Counter row (row 9): cash register PC at counter. Pixel-art cash
  // sits ABOVE the monitor (row 7) — the cashier's till.
  place('PC_FRONT', 17, 8),
  place('CASH', 17, 7),

  // Big table in the cash area (replaces the two small tables that used
  // to live here). The white-haired host (Andrey) sits at it on the
  // north sofa; east/west sofas complete the booth seating like the
  // communal table.
  place('SOFA_FRONT', 16, 1),
  place('SOFA_SIDE', 15, 3),        // cash west sofa
  place('SOFA_SIDE', 19, 3, true),  // cash east sofa (mirrored)
  place('TABLE_FRONT', 16, 2),

  // ── Big communal table (center, rows 11-14) ───────────────────────
  // SOFA_FRONT spans 2 tiles north of the table; SOFA_SIDE flanks east
  // and west. The side sofas are mirrored so their back-rest faces AWAY
  // from the table (so a seated diner faces inward toward the food).
  place('SOFA_FRONT', 11, 10),
  place('SOFA_SIDE', 10, 12),       // west sofa: back faces west (away)
  place('SOFA_SIDE', 14, 12, true), // east sofa: back faces east (away — mirrored)
  place('TABLE_FRONT', 11, 11),
  place('PIZZA', 11, 13),       // classic red pizza, middle-left
  place('PIZZA_GREEN', 12, 12), // pesto/green pizza, top-right (off the
                                // south edge of the table)
  place('BURRITO', 13, 13),     // foil-wrapped burrito — also the
                                // station sign for the dodster quiz

  // ── Dining tables ────────────────────────────────────────────────
  // Each small table has chairs on BOTH north and south sides — full
  // 4-person seating. South chairs use WOODEN_CHAIR_FRONT (we see the
  // chair's seat side); north chairs use WOODEN_CHAIR_BACK (we see the
  // chair's back, which reads as "person facing south at the table").
  //
  // Upper area, east of the cash booth:
  place('SMALL_TABLE_FRONT', 24, 2),
  place('WOODEN_CHAIR_BACK', 24, 1),
  place('WOODEN_CHAIR_BACK', 25, 1),
  place('WOODEN_CHAIR_FRONT', 24, 3),
  place('WOODEN_CHAIR_FRONT', 25, 3),

  place('SMALL_TABLE_FRONT', 24, 6),
  place('WOODEN_CHAIR_BACK', 24, 5),
  place('WOODEN_CHAIR_BACK', 25, 5),
  place('WOODEN_CHAIR_FRONT', 24, 7),
  place('WOODEN_CHAIR_FRONT', 25, 7),

  // Lower dining (south of the big communal table): four small tables
  // in a regular row, all with full seating.
  place('SMALL_TABLE_FRONT', 4, 16),
  place('WOODEN_CHAIR_BACK', 4, 15),
  place('WOODEN_CHAIR_BACK', 5, 15),
  place('WOODEN_CHAIR_FRONT', 4, 17),
  place('WOODEN_CHAIR_FRONT', 5, 17),

  place('SMALL_TABLE_FRONT', 9, 16),
  place('WOODEN_CHAIR_BACK', 9, 15),
  place('WOODEN_CHAIR_BACK', 10, 15),
  place('WOODEN_CHAIR_FRONT', 9, 17),
  place('WOODEN_CHAIR_FRONT', 10, 17),

  place('SMALL_TABLE_FRONT', 19, 16),
  place('WOODEN_CHAIR_BACK', 19, 15),
  place('WOODEN_CHAIR_BACK', 20, 15),
  place('WOODEN_CHAIR_FRONT', 19, 17),
  place('WOODEN_CHAIR_FRONT', 20, 17),

  place('SMALL_TABLE_FRONT', 24, 16),
  place('WOODEN_CHAIR_BACK', 24, 15),
  place('WOODEN_CHAIR_BACK', 25, 15),
  place('WOODEN_CHAIR_FRONT', 24, 17),
  place('WOODEN_CHAIR_FRONT', 25, 17),

  // Dispatch corner (bottom-left) — whiteboard with delivery info
  place('WHITEBOARD', 1, 16),

  // Decor — plants scattered to make the room feel lived-in. Plant
  // behind the tie guy (north of him on the counter band) so it reads
  // as standing decoration behind the diner without crowding him.
  place('PLANT', 12, 9),  // behind tie guy on the counter band
  place('PLANT', 27, 17), // bottom-right corner
  place('PLANT', 1, 11),  // left wall by big table
  place('PLANT', 27, 4),  // upper-right corner of new open dining
  place('PLANT', 14, 5),  // upper-mid open area
  place('PLANT', 6, 17),  // bottom-left dispatch area
  place('CACTUS', 22, 11), // by the open central walkway
  place('BIN', 27, 18),
  place('COFFEE', 11, 1),
];

// ── Interactables (stations) ──────────────────────────────────────

const interactables: Interactable[] = [
  { id: 'oven', col: 3, row: 4, label: 'Печь' },
  { id: 'dough', col: 8, row: 4, label: 'Тесто' },
  { id: 'ingredients', col: 3, row: 8, label: 'Ингредиенты' },
  { id: 'sauces', col: 8, row: 8, label: 'Соусы' },
  { id: 'register', col: 17, row: 7, label: 'Касса' },
  // Courier-style station near the whiteboard — covers delivery time +
  // 60-minute promise.
  { id: 'dispatch', col: 2, row: 18, label: 'Доставка' },
  // Regions chart sits on the big communal table — placed BELOW the
  // table (the south side, now wide open after the table was moved up).
  // Player approaches from the south dining floor.
  { id: 'regions', col: 12, row: 15, label: 'Карта России' },
  // Dodster quiz — visualised by the burrito on the east side of the
  // big table. Player can approach from north, east, or the table's
  // top decorative row.
  { id: 'dodster', col: 13, row: 13, label: 'Додстеры' },
];

// ── Characters ─────────────────────────────────────────────────────

// Palette index → character sprite sheet:
//   0 boy with tie     1 blonde with apron     2 person with afro (orange)
//   3 older with white hair (suit)     4 boy without tie     5 person with red dress
// Six unique palettes for six characters.
const characters = [
  // Sasha (player) — palette 4 (the guy without a tie). Spawns south of
  // the moved-up table in the open dining area so he can see the whole
  // pizzeria at the start.
  createCharacter({
    id: 'sasha',
    paletteIndex: 4,
    col: 20,
    row: 16,
    isPlayer: true,
    name: 'Саша',
    dir: Direction.UP,
  }),
  // Vika (manager) — palette 1 (blonde girl). Stationed east of the
  // cash booth in the open upper-right dining area, wandering between
  // the customer tables.
  createCharacter({
    id: 'vika',
    paletteIndex: 1,
    col: 23,
    row: 4,
    name: 'Вика',
    dir: Direction.DOWN,
    wanders: true,
    wanderRadius: 3,
  }),
  // Andrey (white-haired host) — palette 3. With the kitchen area gone,
  // he no longer roams the prep stations; he's posted behind the big
  // table by the cash register, sitting on the north sofa.
  createCharacter({
    id: 'pizzaiolo_1',
    paletteIndex: 3,
    col: 17,
    row: 1,
    name: 'Андрей',
    dir: Direction.DOWN,
    wanders: false,
    seated: true,
  }),

  // ── Three diners seated on sofas around the big communal table ────
  // The big table is at cols 11–13, rows 15–18 (south side closest to
  // viewer is empty). Each diner is from a different federal district
  // and is placed sitting on a sofa.

  // Diner positions track the moved table (table now at rows 11-14).

  // North side — Far East (Дальневосточный ФО)
  createCharacter({
    id: 'diner_far_east',
    paletteIndex: 0,
    col: 12,
    row: 10,
    name: 'Гость из Владивостока',
    dir: Direction.DOWN,
    wanders: false,
    seated: true,
  }),
  // West side — Volga (Приволжский ФО) — palette 2 (afro orange)
  createCharacter({
    id: 'diner_volga',
    paletteIndex: 2,
    col: 10,
    row: 12,
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
    row: 12,
    name: 'Гость из Красноярска',
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
