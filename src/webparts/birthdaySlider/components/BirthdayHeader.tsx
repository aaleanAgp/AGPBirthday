import * as React from 'react';
import styles from '../styles/BirthdayHeader.module.scss';

interface IBirthdayHeaderProps {
  title: string;
  subtitle: string;
  linkText: string;
  linkUrl: string;
}

const BANNER_URL = 'https://agpglass.sharepoint.com/sites/AGPNewsColombia/Recursos/images/banner.png';
const HIGHLIGHT_PATTERN = /(Con[oó]celos aqu[ií]:?)/i;

const BirthdayHeader: React.FC<IBirthdayHeaderProps> = ({
  title,
  subtitle,
  linkText,
  linkUrl
}) => {
  const subtitleParts = subtitle.split(HIGHLIGHT_PATTERN);

  return (
    <div className={styles.header}>
      <div className={styles.banner} aria-hidden="true">
        <img src={BANNER_URL} alt="" />
      </div>
      <div className={styles.titleSection}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.description}>
          <p className={styles.subtitle}>
            {subtitleParts.map((part, index) => (
              HIGHLIGHT_PATTERN.test(part) ? (
                <strong key={index} className={styles.subtitleHighlight}>{part}</strong>
              ) : (
                <React.Fragment key={index}>{part}</React.Fragment>
              )
            ))}
          </p>
          {linkUrl && (
            <a href={linkUrl} className={styles.link} target="_self" rel="noopener noreferrer">
              {linkText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayHeader;
