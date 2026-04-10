import * as React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { IBirthdayPerson } from '../models/BirthdayPerson';
import BirthdayCard from './BirthdayCard';
import styles from '../styles/BirthdayCarousel.module.scss';

// Type workaround: @splidejs/react-splide re-exports the vanilla Splide class in a way
// that TypeScript (SPFx 1.18 / TS 4.7) cannot resolve as a valid React JSX element.
// Casting to React.ComponentType<any> sidesteps the type conflict without affecting runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SplideCarousel: React.ComponentType<any> = Splide as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SplideSlideItem: React.ComponentType<any> = SplideSlide as any;

interface IBirthdayCarouselProps {
  people: IBirthdayPerson[];
  siteUrl: string;
  onGreetClick: (person: IBirthdayPerson) => void;
}

/**
 * Carousel built with @splidejs/react-splide (Splide v4 — same version as the legacy).
 * Options mirror the original carousel behavior: slide type, 4 items on desktop,
 * responsive breakpoints down to 1 item on mobile.
 *
 * Splide base CSS is embedded via BirthdayCarousel.module.scss (:global block)
 * to avoid the `require(css)` pattern that TypeScript rejects in SPFx.
 */
const BirthdayCarousel: React.FC<IBirthdayCarouselProps> = ({ people, siteUrl, onGreetClick }) => {
  const splideOptions = {
    type: 'slide',
    perPage: 4,
    perMove: 1,
    gap: '24px',
    arrows: true,
    pagination: false,
    rewind: false,
    breakpoints: {
      1200: { perPage: 3 },
      992:  { perPage: 2 },
      750:  { perPage: 1 }
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
              onGreetClick={onGreetClick}
            />
          </SplideSlideItem>
        ))}
      </SplideCarousel>
    </div>
  );
};

export default BirthdayCarousel;
