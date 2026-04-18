import type { PixelChartProps } from '../ui/PixelChart';

export interface StoryBeat {
  /** Speaker label or 'narrator' */
  speaker: 'narrator' | 'Саша' | 'Вика';
  text: string;
  /** Optional pixel chart shown alongside the beat */
  chart?: PixelChartProps;
  /** Optional caption for the chart */
  caption?: string;
}

export const STORY_BEATS: StoryBeat[] = [
  {
    speaker: 'narrator',
    text:
      'Вечер. Смена подходит к концу. Саша обошёл всю пиццерию и собрал в голове всю картину работы Додо.',
  },
  {
    speaker: 'narrator',
    text:
      'За один день в средней пиццерии Додо проходит больше 300 заказов. Это значит — больше 300 раскатанных пицц, ровно собранных коробок и довольных клиентов.',
    caption: 'Заказы за день, шт.',
    chart: {
      type: 'bar',
      data: [
        { label: 'Утро', value: 42 },
        { label: 'Обед', value: 96 },
        { label: 'День', value: 58 },
        { label: 'Вечер', value: 124 },
        { label: 'Ночь', value: 21 },
      ],
      unit: 'зак',
    },
  },
  {
    speaker: 'narrator',
    text:
      'Лидер всех меню — Пепперони. Если бы все её куски за месяц выложить в одну линию, получилась бы колбасная дорожка длиной с футбольное поле.',
    caption: 'Доля топ-пицц от всех заказов',
    chart: {
      type: 'pie',
      data: [
        { label: 'Пепперони', value: 31 },
        { label: 'Маргарита', value: 24 },
        { label: 'Гавайская', value: 18 },
        { label: 'Четыре сыра', value: 13 },
        { label: 'Прочие', value: 14 },
      ],
      unit: '%',
    },
  },
  {
    speaker: 'narrator',
    text:
      'У курьеров своя гонка: суббота — день, когда среднее время доставки ползёт вверх. Обещание «60 минут или бесплатно» держит всю команду в тонусе.',
    caption: 'Среднее время доставки, мин',
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
  {
    speaker: 'narrator',
    text:
      'И главное — детали. Базилик и шпинат, пепперони и салями, моцарелла и сулугуни. Один неверный лист — и вкус уже не тот. Стандарты Додо — это сотни маленьких «правильно».',
  },
];

export function getVerdict(score: number, total: number): { speaker: 'Вика'; text: string } {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.85) {
    return {
      speaker: 'Вика',
      text:
        'Саша, я в тебе ошибалась. Ты действительно знаешь Додо до последней оливки. Завтра у тебя новая смена — и, возможно, повышение.',
    };
  }
  if (ratio >= 0.5) {
    return {
      speaker: 'Вика',
      text:
        'Неплохо, Саша. Половину знаешь, половину — нет. Подтянем оставшееся на тренинге, и я снова приду с проверкой.',
    };
  }
  return {
    speaker: 'Вика',
    text:
      'Саша, я ценю твой энтузиазм, но цифры не врут. Возможно, гитара действительно зовёт сильнее, чем печь. Подумай.',
  };
}
