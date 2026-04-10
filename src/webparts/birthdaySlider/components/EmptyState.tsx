import * as React from 'react';
import styles from '../styles/EmptyState.module.scss';

interface IEmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<IEmptyStateProps> = ({
  message = 'No hay próximos cumpleaños.'
}) => (
  <div className={styles.emptyState}>
    <span className={styles.icon} aria-hidden="true">🎂</span>
    <p className={styles.message}>{message}</p>
  </div>
);

export default EmptyState;
