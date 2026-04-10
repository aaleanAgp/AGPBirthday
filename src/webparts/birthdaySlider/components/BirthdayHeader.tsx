import * as React from 'react';
import styles from '../styles/BirthdayHeader.module.scss';

interface IBirthdayHeaderProps {
  title: string;
  subtitle: string;
  linkText: string;
  linkUrl: string;
}

/**
 * Renders the banner image, title, subtitle and "View all" link.
 *
 * TODO: Replace the banner placeholder with an actual image asset from SharePoint.
 * Legacy path was relative to the bundle (e.g. ../images/banner.png).
 * Recommended: upload banner to the site assets library and reference via an
 * absolute URL, or configure it via the web part property pane.
 */
const BirthdayHeader: React.FC<IBirthdayHeaderProps> = ({
  title,
  subtitle,
  linkText,
  linkUrl
}) => (
  <div className={styles.header}>
    <div className={styles.banner} aria-hidden="true">
      {/* TODO: <img src="BANNER_URL" alt="" /> */}
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
