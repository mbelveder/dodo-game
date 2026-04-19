import { getVerdict } from '../content/ending';

interface EndingStoryProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export function EndingStory({ score, total, onRestart }: EndingStoryProps) {
  const verdict = getVerdict(score, total);

  return (
    <div className="endingScreen">
      <div className="endingCard">
        <div className="endingTitle">Конец смены</div>
        <div className="endingScore">
          Правильных ответов: <b>{score}</b> из {total}
        </div>
        <div className="endingVerdict">
          <div className="endingSpeaker">{verdict.speaker}:</div>
          <div className="endingText">{verdict.text}</div>
        </div>
        <div className="endingCredits">
          <div className="endingCreditsNames">
            <div>Тимофей Атнашев</div>
            <div>Михаил Бельведерский</div>
            <div>Андрей Караваев</div>
            <div>Илья Козицкий</div>
            <div>Ромазан Самодинов</div>
          </div>
          <div className="endingCreditsTeam">Команда «Кермит»</div>
        </div>
        <div className="endingActions">
          <button className="btn btnPrimary" onClick={onRestart}>
            Попробовать снова ▸
          </button>
        </div>
        <div className="endingFooter">
          Хакатон по дата-журналистике · Данные Dodo Pizza
        </div>
      </div>
    </div>
  );
}
