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

/** One infographic + quiz; used alone or as part of `Station.steps`. */
export interface StationStep {
  /** Extra lead-in for this step (shown under the main station intro when set). */
  intro?: string;
  infographic: Infographic;
  quiz: QuizQuestion;
}

export interface Station {
  id: string;
  label: string;
  /** Short pre-quiz hint shown at the top of the modal */
  intro: string;
  infographic: Infographic;
  quiz: QuizQuestion;
  /** When present, the modal runs these steps in order (overrides flat infographic/quiz). */
  steps?: StationStep[];
}

export function getStationSteps(station: Station): StationStep[] {
  if (station.steps && station.steps.length > 0) return station.steps;
  return [{ infographic: station.infographic, quiz: station.quiz }];
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
      'Касса — пульс пиццерии. Чек за чеком, регион за регионом. Изучи статистику средних чеков по стране.',
    infographic: {
      kind: 'image',
      src: '/img/bill.png',
      caption: 'Средний чек по федеральным округам и крупным городам',
      alt: 'Рейтинг регионов по среднему чеку Додо',
    },
    quiz: {
      question:
        'Какой субъект РФ занимает пятое место по размеру среднего чека?',
      options: [
        'Приволжский ФО',
        'Санкт-Петербург',
        'Центральный ФО',
        'Сибирский ФО',
      ],
      correctIndex: 3,
      explain:
        'Сибирский ФО уверенно держится в первой пятёрке.',
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
  {
    id: 'dodster',
    label: 'Додстеры',
    intro:
      'На столе — додстер в фольге. Расстояние между двумя столицами измеряют и в километрах, и в долях меню.',
    infographic: {
      kind: 'image',
      src: '/img/dodster.png',
      caption: 'Додстер в фольге — визитная карточка меню',
      alt: 'Додстер, завёрнутый в фольгу',
    },
    quiz: {
      question:
        'Сколько километров примерно от Москвы до Санкт-Петербурга по основным автомагистралям (порядок величины)?',
      options: ['Около 400 км', 'Около 700 км', 'Около 1100 км', 'Около 1500 км'],
      correctIndex: 1,
      explain:
        'Около 700 км по дороге — типичный масштаб логистики между двумя крупнейшими рынками Додо.',
    },
  },
  {
    id: 'regions',
    label: 'Карта России',
    intro:
      'За одним столом — гости из Владивостока, Казани и Красноярска. Сначала сравним две столицы по додстерам на графике.',
    infographic: {
      kind: 'image',
      src: '/img/dodster.png',
      caption: 'Покупки додстеров: Москва vs Санкт-Петербург',
      alt: 'График покупок додстеров в двух столицах',
    },
    quiz: {
      question:
        'Разница в покупке додстеров между Москвой и Петербургом больше 5%?',
      options: ['Да', 'Нет'],
      correctIndex: 0,
      explain:
        'Да — по данным разница между столицами превышает 5%. Питеру нужно поднажать!',
    },
    steps: [
      {
        infographic: {
          kind: 'image',
          src: '/img/dodster.png',
          caption: 'Покупки додстеров: Москва vs Санкт-Петербург',
          alt: 'График покупок додстеров в двух столицах',
        },
        quiz: {
          question:
            'Разница в покупке додстеров между Москвой и Петербургом больше 5%?',
          options: ['Да', 'Нет'],
          correctIndex: 0,
          explain:
            'Да — по данным разница между столицами превышает 5%: Москва и Петербург близки по масштабу рынка, но не совпадают до процента.',
        },
      },
      {
        intro: 'Средняя выручка на пиццерию по разным субъектам РФ.',
        infographic: {
          kind: 'pixelChart',
          caption: 'Средняя выручка на пиццерию по субъектам РФ, млн ₽ за период',
          chart: {
            type: 'hbar',
            // Sorted by value descending so the Far East surprise is visible at a glance.
            data: [
              { label: 'Дальневосточный ФО', value: 7.05 },
              { label: 'Уральский ФО', value: 5.69 },
              { label: 'Санкт-Петербург', value: 5.24 },
              { label: 'Северо-Западный ФО', value: 4.88 },
              { label: 'Москва', value: 4.85 },
              { label: 'Сибирский ФО', value: 4.64 },
              { label: 'Ленинградская область', value: 4.53 },
              { label: 'Приволжский ФО', value: 4.52 },
              { label: 'Московская область', value: 4.05 },
              { label: 'Южный ФО', value: 3.84 },
              { label: 'Центральный ФО', value: 3.28 },
              { label: 'Северо-Кавказский ФО', value: 2.79 },
            ],
            unit: 'млн ₽',
          },
        },
        quiz: {
          question: 'Какой регион приносит наибольший доход?',
          options: [
            'Москва',
            'Санкт-Петербург',
            'Дальневосточный ФО',
            'Не хватает данных',
          ],
          correctIndex: 2,
          explain:
            'Дальневосточный ФО — лидер по этой метрике: там Додо стала массовым брендом, а выручка на точку выше из-за расстояний и крупных семейных заказов.',
        },
      },
    ],
  },
];
