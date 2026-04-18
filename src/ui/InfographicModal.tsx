import type { Station } from '../content/stations';
import { Infographic } from './Infographic';
import { Quiz } from './Quiz';

interface InfographicModalProps {
  station: Station;
  onAnswer: (chosenIndex: number, correct: boolean) => void;
  onClose: () => void;
}

export function InfographicModal({ station, onAnswer, onClose }: InfographicModalProps) {
  return (
    <div className="modalScrim" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTag">Станция</div>
          <div className="modalTitle">{station.label}</div>
          <button className="modalClose" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="modalIntro">{station.intro}</div>
        <div className="modalGrid">
          <div className="modalChartSlot">
            <Infographic data={station.infographic} />
          </div>
          <div className="modalQuizSlot">
            <Quiz question={station.quiz} onAnswer={onAnswer} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
