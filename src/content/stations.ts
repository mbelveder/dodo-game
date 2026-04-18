import type { PixelChartProps } from '../ui/PixelChart';

export type Infographic =
  | { kind: 'image'; src: string; caption?: string; alt?: string }
  | { kind: 'pixelChart'; chart: PixelChartProps; caption?: string };

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  /** Shown after the player answers, regardless of correctness */
  explain: string;
}

export interface Station {
  id: string;
  label: string;
  /** Short pre-quiz hint shown at the top of the modal */
  intro: string;
  infographic: Infographic;
  quiz: QuizQuestion;
}

/**
 * IMPORTANT: station ids must match the `id` of interactables placed in
 * `scene/pizzeriaLayout.ts`. Currently: oven, dough, ingredients, sauces,
 * register, dispatch.
 *
 * Teammates: drop your infographics into `public/infographics/` and reference
 * by `/infographics/<file>.png`, OR replace `kind: 'image'` with
 * `kind: 'pixelChart'` and supply chart data.
 */
export const STATIONS: Station[] = [
  {
    id: 'oven',
    label: 'Печь',
    intro:
      'Печь работает 16 часов в сутки. Здесь рождаются все пиццы Додо. Узнай, какая пицца нагревает её чаще всего.',
    infographic: {
      kind: 'pixelChart',
      caption: 'Топ-5 пицц по числу заказов за месяц',
      chart: {
        type: 'hbar',
        data: [
          { label: 'Пепперони', value: 1240 },
          { label: 'Маргарита', value: 980 },
          { label: 'Гавайская', value: 760 },
          { label: 'Четыре сыра', value: 540 },
          { label: 'Мясная', value: 410 },
        ],
        unit: 'шт',
      },
    },
    quiz: {
      question: 'Какая пицца самая популярная в Додо?',
      options: ['Маргарита', 'Пепперони', 'Гавайская', 'Четыре сыра'],
      correctIndex: 1,
      explain:
        'Пепперони — абсолютный лидер. Она опережает Маргариту почти на треть заказов.',
    },
  },
  {
    id: 'dough',
    label: 'Тесто',
    intro:
      'Тесто Додо отдыхает 24 часа перед раскаткой. Сколько килограммов уходит на одну смену?',
    infographic: {
      kind: 'pixelChart',
      caption: 'Расход теста за неделю, кг',
      chart: {
        type: 'bar',
        data: [
          { label: 'Пн', value: 38 },
          { label: 'Вт', value: 41 },
          { label: 'Ср', value: 44 },
          { label: 'Чт', value: 47 },
          { label: 'Пт', value: 72 },
          { label: 'Сб', value: 88 },
          { label: 'Вс', value: 81 },
        ],
        unit: 'кг',
      },
    },
    quiz: {
      question: 'В какой день недели расход теста максимальный?',
      options: ['Пятница', 'Суббота', 'Воскресенье', 'Среда'],
      correctIndex: 1,
      explain:
        'Суббота — пик. К субботе люди заказывают больше всего, и тесто приходится готовить заранее.',
    },
  },
  {
    id: 'ingredients',
    label: 'Ингредиенты',
    intro:
      'У Додо строгий список ингредиентов. Один из них чаще всего путают новички. Изучи раскладку.',
    infographic: {
      kind: 'pixelChart',
      caption: 'Доля ошибок по ингредиенту, %',
      chart: {
        type: 'pie',
        data: [
          { label: 'Базилик ↔ Шпинат', value: 34 },
          { label: 'Моцарелла ↔ Сулугуни', value: 22 },
          { label: 'Пепперони ↔ Салями', value: 18 },
          { label: 'Прочее', value: 26 },
        ],
        unit: '%',
      },
    },
    quiz: {
      question: 'Какие два ингредиента путают чаще всего?',
      options: [
        'Моцарелла и сулугуни',
        'Пепперони и салями',
        'Базилик и шпинат',
        'Оливки и каперсы',
      ],
      correctIndex: 2,
      explain:
        'Базилик и шпинат — главные жертвы спешки. Запомни: у базилика лист гладкий и пахнет иначе.',
    },
  },
  {
    id: 'sauces',
    label: 'Соусы',
    intro:
      'Соусы — душа пиццы. Какой из дополнительных соусов берут чаще всего к доставке?',
    infographic: {
      kind: 'pixelChart',
      caption: 'Дополнительные соусы к заказу, %',
      chart: {
        type: 'hbar',
        data: [
          { label: 'Чесночный', value: 41 },
          { label: 'Сырный', value: 28 },
          { label: 'Барбекю', value: 17 },
          { label: 'Ранч', value: 9 },
          { label: 'Острый', value: 5 },
        ],
        unit: '%',
      },
    },
    quiz: {
      question: 'Самый популярный дополнительный соус Додо — это…',
      options: ['Сырный', 'Барбекю', 'Чесночный', 'Ранч'],
      correctIndex: 2,
      explain:
        'Чесночный соус — фаворит. Его берут к каждой третьей пицце на доставке.',
    },
  },
  {
    id: 'register',
    label: 'Касса',
    intro:
      'Касса — пульс пиццерии. Когда у нас час пик, и сколько клиентов проходит через неё?',
    infographic: {
      kind: 'pixelChart',
      caption: 'Заказы по часам в будний день',
      chart: {
        type: 'line',
        data: [
          { label: '11', value: 8 },
          { label: '12', value: 18 },
          { label: '13', value: 31 },
          { label: '14', value: 22 },
          { label: '15', value: 14 },
          { label: '16', value: 12 },
          { label: '17', value: 19 },
          { label: '18', value: 34 },
          { label: '19', value: 47 },
          { label: '20', value: 41 },
          { label: '21', value: 26 },
        ],
        unit: 'зак.',
      },
    },
    quiz: {
      question: 'В какое время самый большой пик заказов?',
      options: ['13:00', '18:00', '19:00', '21:00'],
      correctIndex: 2,
      explain:
        '19:00 — главный пик ужина. Второй, поменьше, приходится на обед в 13:00.',
    },
  },
  {
    id: 'dispatch',
    label: 'Доставка',
    intro:
      'Сколько времени занимает доставка? И сколько успевает курьер за смену? Изучи доску.',
    infographic: {
      kind: 'pixelChart',
      caption: 'Среднее время доставки по дням, мин',
      chart: {
        type: 'line',
        data: [
          { label: 'Пн', value: 23 },
          { label: 'Вт', value: 24 },
          { label: 'Ср', value: 25 },
          { label: 'Чт', value: 27 },
          { label: 'Пт', value: 32 },
          { label: 'Сб', value: 35 },
          { label: 'Вс', value: 31 },
        ],
        unit: 'мин',
      },
    },
    quiz: {
      question:
        'Если доставка превысила 60 минут, что Додо обещает клиенту?',
      options: [
        'Скидку 10%',
        'Бесплатный соус',
        'Заказ бесплатно',
        'Купон на 200 ₽',
      ],
      correctIndex: 2,
      explain:
        'Знаменитое обещание Додо: дольше 60 минут — заказ за наш счёт. Поэтому в субботу курьеры особенно собранны.',
    },
  },
];
