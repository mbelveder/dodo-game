import type { Infographic as InfographicData } from '../content/stations';
import { PixelChart } from './PixelChart';

interface InfographicProps {
  data: InfographicData;
}

export function Infographic({ data }: InfographicProps) {
  if (data.kind === 'image') {
    return (
      <figure className="infoFigure">
        <img className="infoImage" src={data.src} alt={data.alt ?? ''} />
        {data.caption && <figcaption className="infoCaption">{data.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <figure className="infoFigure">
      <PixelChart {...data.chart} />
      {data.caption && <figcaption className="infoCaption">{data.caption}</figcaption>}
    </figure>
  );
}
