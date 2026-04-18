import { useState } from 'react';

import { INTRO_DIALOGUE } from '../content/intro';
import { DialogueBox } from './DialogueBox';

interface IntroCutsceneProps {
  onFinish: () => void;
}

export function IntroCutscene({ onFinish }: IntroCutsceneProps) {
  const [step, setStep] = useState(0);
  const line = INTRO_DIALOGUE[step];
  const isLast = step === INTRO_DIALOGUE.length - 1;

  return (
    <div className="introScreen">
      <div className="introTitle">
        <div className="introBrand">DODO</div>
        <div className="introSub">Смена Саши</div>
      </div>
      <DialogueBox
        speaker={line.speaker}
        text={line.text}
        showSkip
        onSkip={onFinish}
        onNext={() => {
          if (isLast) onFinish();
          else setStep((s) => s + 1);
        }}
        nextLabel={isLast ? 'Начать смену ▸' : 'Дальше ▸'}
      />
    </div>
  );
}
