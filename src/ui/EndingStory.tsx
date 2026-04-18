import { useState } from 'react';

import { getVerdict, STORY_BEATS } from '../content/ending';
import { PixelChart } from './PixelChart';

interface EndingStoryProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export function EndingStory({ score, total, onRestart }: EndingStoryProps) {
  const verdict = getVerdict(score, total);
  const [step, setStep] = useState(0);
  const beats = STORY_BEATS;
  const isLastBeat = step >= beats.length;

  if (isLastBeat) {
    return (
      <div className="endingScreen">
        <div className="endingCard">
          <div className="endingTitle">Конец смены</div>
          <div className="endingScore">
            Правильных ответов: <b>{score}</b> из {total}
          </div>
          <div className="endingVerdict">
            <div className="endingSpeaker">Вика:</div>
            <div className="endingText">{verdict.text}</div>
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

  const beat = beats[step];
  return (
    <div className="endingScreen">
      <div className="endingCard">
        <div className="endingProgress">
          {step + 1} / {beats.length}
        </div>
        {beat.chart && (
          <div className="endingChart">
            <PixelChart {...beat.chart} width={420} height={260} />
            {beat.caption && <div className="endingCaption">{beat.caption}</div>}
          </div>
        )}
        <div className="endingBeat">
          <div className="endingSpeaker">
            {beat.speaker === 'narrator' ? '— Рассказчик —' : `${beat.speaker}:`}
          </div>
          <div className="endingText">{beat.text}</div>
        </div>
        <div className="endingActions">
          <button className="btn btnPrimary" onClick={() => setStep((s) => s + 1)}>
            {step === beats.length - 1 ? 'К итогу ▸' : 'Дальше ▸'}
          </button>
        </div>
      </div>
    </div>
  );
}
