import * as React from 'react';
import styles from '../styles/BirthdayHeader.module.scss';

interface IBirthdayHeaderProps {
  title: string;
  subtitle: string;
  linkText: string;
  linkUrl: string;
}

const BANNER_URL = 'https://agpglass.sharepoint.com/sites/AGPNewsColombia/Recursos/images/banner.png';

const BirthdayHeader: React.FC<IBirthdayHeaderProps> = ({
  title,
  subtitle,
  linkText,
  linkUrl
}) => (
  <div className={styles.header}>
    <div className={styles.banner} aria-hidden="true">
      <img src={BANNER_URL} alt="" />
    </div>
    <div className={styles.titleSection}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.description}>
        <p className={styles.subtitle}>{subtitle}</p>
        {linkUrl && (
          <a href={linkUrl} className={styles.link} target="_self" rel="noopener noreferrer">
            {linkText}
          </a>
        )}
      </div>
    </div>
  </div>
);

export default BirthdayHeader;
