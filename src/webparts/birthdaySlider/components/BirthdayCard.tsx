import * as React from 'react';
import { IBirthdayPerson } from '../models/BirthdayPerson';
import { isGreetingEnabled } from '../utils/birthdayRules';
import { formatBirthdayDate } from '../utils/dateUtils';
import { getProfilePhotoUrl, getFallbackPhotoUrl } from '../utils/photoUtils';
import styles from '../styles/BirthdayCard.module.scss';

interface IBirthdayCardProps {
  person: IBirthdayPerson;
  siteUrl: string;
  onGreetClick: (person: IBirthdayPerson) => void;
}

const BirthdayCard: React.FC<IBirthdayCardProps> = ({ person, siteUrl, onGreetClick }) => {
  const [imgError, setImgError] = React.useState<boolean>(false);

  const greetEnabled = isGreetingEnabled(person);
  const formattedDate = formatBirthdayDate(person.birthdayDay, person.birthdayMonth);
  const photoUrl = imgError
    ? getFallbackPhotoUrl(siteUrl)
    : getProfilePhotoUrl(person.email, siteUrl, 'L');

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <p className={styles.date}>{formattedDate}</p>
        <div className={styles.avatarWrapper}>
          <img
            src={photoUrl}
            alt={`Foto de ${person.name}`}
            className={styles.avatar}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
        <h3 className={styles.name}>{person.name}</h3>
        <p className={styles.jobTitle}>{person.jobTitle}</p>
      </div>

      <button
        className={`${styles.greetButton} ${greetEnabled ? styles.greetButtonEnabled : styles.greetButtonDisabled}`}
        onClick={() => greetEnabled && onGreetClick(person)}
        disabled={!greetEnabled}
        aria-label={
          greetEnabled
            ? `Enviar saludo a ${person.name}`
            : `El saludo está disponible únicamente el día del cumpleaños de ${person.name}`
        }
        title={greetEnabled ? '¡Envía un saludo!' : 'Disponible el día del cumpleaños'}
      >
        ¡Envía un saludo!
      </button>
    </div>
  );
};

export default BirthdayCard;
