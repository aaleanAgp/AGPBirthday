import * as React from 'react';
import styles from '../styles/LoaderOverlay.module.scss';

const LoaderOverlay: React.FC = () => (
  <div className={styles.loaderWrapper} role="status" aria-label="Cargando cumpleaños...">
    <div className={styles.ripple}>
      <div />
      <div />
    </div>
  </div>
);

export default LoaderOverlay;
