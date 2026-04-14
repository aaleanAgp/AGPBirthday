import * as React from 'react';
import { IBirthdayPerson } from '../../birthdaySlider/models/BirthdayPerson';
import { formatBirthdayDate } from '../../birthdaySlider/utils/dateUtils';
import { getFallbackPhotoUrl, getProfilePhotoUrl } from '../../birthdaySlider/utils/photoUtils';
import styles from '../styles/BirthdayAllCard.module.scss';

interface IBirthdayAllCardProps {
  person: IBirthdayPerson;
  siteUrl: string;
}

const BirthdayAllCard: React.FC<IBirthdayAllCardProps> = ({ person, siteUrl }) => {
  const [imgError, setImgError] = React.useState<boolean>(false);
  const photoUrl = imgError
    ? getFallbackPhotoUrl(siteUrl)
    : getProfilePhotoUrl(person.email, siteUrl, 'L');

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <p className={styles.date}>{formatBirthdayDate(person.birthdayDay, person.birthdayMonth)}</p>
        {person.areaName && <span className={styles.badge}>{person.areaName}</span>}
      </div>

      <div className={styles.avatarWrapper}>
        <img
          src={photoUrl}
          alt={`Foto de ${person.name}`}
          className={styles.avatar}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      <h3 className={styles.name}>{person.name}</h3>
      <p className={styles.jobTitle}>{person.jobTitle || 'Sin cargo registrado'}</p>
      <p className={styles.email}>{person.email || 'Sin correo registrado'}</p>
    </article>
  );
};

export default BirthdayAllCard;
