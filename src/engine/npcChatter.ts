import { showBubble } from './character';
import type { Character } from './types';

/** Pool of ambient one-liners per NPC id. */
const CHATTER: Record<string, string[]> = {
  vika: [
    'Не забудь про стандарты!',
    'Где отчёт по продажам?',
    'Саша, ты помнишь, что у нас сегодня проверка?',
  ],
  pizzaiolo_1: [
    'Печь готова, кидай тесто!',
    'Сегодня заказов больше обычного…',
    'Маргариту делаем!',
  ],
  pizzaiolo_2: [
    'Тесто отдыхает 24 часа.',
    'Базилик закончился!',
    'Соус — главное.',
  ],
  courier: [
    'Везу две Пепперони!',
    'Пробки, опять пробки.',
    'Через 30 минут — иначе бесплатно!',
  ],
  visitor_1: [
    'Ммм, пахнет вкусно.',
    'Я бы заказал ещё одну.',
    'Спасибо, очень вкусно!',
    'Можно соус ранч?',
  ],
};

interface ChatterState {
  /** Time until next bubble can fire (per character) */
  nextAt: Map<string, number>;
}

export function createChatterState(): ChatterState {
  return { nextAt: new Map() };
}

export function updateNpcChatter(
  state: ChatterState,
  characters: Character[],
  dt: number,
): void {
  for (const ch of characters) {
    if (ch.isPlayer) continue;
    const pool = CHATTER[ch.id];
    if (!pool || pool.length === 0) continue;
    const next = state.nextAt.get(ch.id);
    if (next === undefined) {
      state.nextAt.set(ch.id, 5 + Math.random() * 12);
      continue;
    }
    const nextNew = next - dt;
    if (nextNew <= 0 && !ch.bubble) {
      const line = pool[Math.floor(Math.random() * pool.length)];
      showBubble(ch, line, 3.5);
      state.nextAt.set(ch.id, 14 + Math.random() * 18);
    } else {
      state.nextAt.set(ch.id, nextNew);
    }
  }
}
