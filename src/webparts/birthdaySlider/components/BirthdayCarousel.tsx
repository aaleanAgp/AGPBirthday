import * as React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { IBirthdayPerson } from '../models/BirthdayPerson';
import { IBirthdayConfig } from '../models/BirthdayConfig';
import BirthdayCard from './BirthdayCard';
import styles from '../styles/BirthdayCarousel.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SplideCarousel: React.ComponentType<any> = Splide as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SplideSlideItem: React.ComponentType<any> = SplideSlide as any;

interface IBirthdayCarouselProps {
  people: IBirthdayPerson[];
  siteUrl: string;
  config: IBirthdayConfig;
  onGreetClick: (person: IBirthdayPerson) => void;
}

const BirthdayCarousel: React.FC<IBirthdayCarouselProps> = ({ people, siteUrl, config, onGreetClick }) => {
  const splideOptions = {
    type: 'slide',
    perPage: 6,
    perMove: 1,
    gap: '48px',
    arrows: true,
    arrowPath: 'm15.5 0.932-4.3 4.38 14.5 14.6-14.5 14.5 4.3 4.4 14.6-14.6 4.4-4.3-4.4-4.4-14.6-14.6z',
    pagination: false,
    rewind: false,
    breakpoints: {
      1500: { perPage: 5 },
      1250: { perPage: 4 },
      1000: { perPage: 3 },
      750:  { perPage: 2 },
      500:  { perPage: 1 }
    }
  };

  return (
    <div className={styles.carouselWrapper}>
      <SplideCarousel options={splideOptions} aria-label="Próximos cumpleaños">
        {people.map(person => (
          <SplideSlideItem key={person.id}>
            <BirthdayCard
              person={person}
              siteUrl={siteUrl}
              config={config}
              onGreetClick={onGreetClick}
            />
          </SplideSlideItem>
        ))}
      </SplideCarousel>
    </div>
  );
};

export default BirthdayCarousel;
