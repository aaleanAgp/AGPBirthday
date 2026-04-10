import * as React from 'react';
import { useState } from 'react';
import { IBirthdayPerson } from '../models/BirthdayPerson';
import { IBirthdayConfig } from '../models/BirthdayConfig';
import { IGreetingCardTemplate } from '../models/GreetingCardTemplate';
import { getProfilePhotoUrl, getFallbackPhotoUrl } from '../utils/photoUtils';
import { formatBirthdayDate } from '../utils/dateUtils';
import styles from '../styles/GreetingModal.module.scss';

interface IGreetingModalProps {
  person: IBirthdayPerson;
  config: IBirthdayConfig;
  cardTemplates: IGreetingCardTemplate[];
  siteUrl: string;
  isSending: boolean;
  onClose: () => void;
  onSend: (card: IGreetingCardTemplate, message: string) => Promise<void>;
}

/**
 * Modal for composing and sending a birthday greeting.
 *
 * Flow:
 *   1. User selects a card template (radio group)
 *   2. User types a personal message (textarea)
 *   3. Validation on submit — both fields required
 *   4. Calls onSend() which delegates to GreetingService
 *
 * All display texts come from IBirthdayConfig (loaded from SharePoint Configuracion list).
 */
const GreetingModal: React.FC<IGreetingModalProps> = ({
  person,
  config,
  cardTemplates,
  siteUrl,
  isSending,
  onClose,
  onSend
}) => {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);

  const photoUrl = imgError
    ? getFallbackPhotoUrl(siteUrl)
    : getProfilePhotoUrl(person.email, siteUrl, 'M');

  const selectedCard = cardTemplates.find(c => c.id === selectedCardId) || null;

  const handleSend = async (): Promise<void> => {
    setValidationError(null);
    setSendError(null);

    if (!selectedCard) {
      setValidationError(config.validateCard);
      return;
    }
    if (!message.trim()) {
      setValidationError(config.validateMessage);
      return;
    }

    try {
      await onSend(selectedCard, message.trim());
    } catch {
      setSendError(config.messageWarning);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!isSending && e.target === e.currentTarget) onClose();
  };

  const handleCardChange = (id: number): void => {
    setSelectedCardId(id);
    setValidationError(null);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>

        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          disabled={isSending}
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* TODO: Replace placeholder background with actual modal banner image */}
        <div className={styles.modalBanner} aria-hidden="true" />

        <div className={styles.body}>

          {/* Recipient info */}
          <div className={styles.profileInfo}>
            <div className={styles.profileContent}>
              <img
                src={photoUrl}
                alt={`Foto de ${person.name}`}
                className={styles.profileAvatar}
                onError={() => setImgError(true)}
              />
              <div>
                <p className={styles.profileDate}>
                  {formatBirthdayDate(person.birthdayDay, person.birthdayMonth)}
                </p>
                <h5 className={styles.profileName}>{person.name}</h5>
                <p>{person.jobTitle}</p>
              </div>
            </div>
          </div>

          {/* Section title (from config) */}
          <h4 className={styles.sectionTitle}>{config.titlePopup}</h4>

          {/* Instruction text */}
          <p><strong>{config.descriptionPopup}</strong></p>

          {/* Card template selection */}
          <div className={styles.cardOptions}>
            {cardTemplates.map(card => (
              <div
                key={card.id}
                className={`${styles.cardOption} ${selectedCardId === card.id ? styles.cardOptionSelected : ''}`}
              >
                <input
                  type="radio"
                  id={`card-${card.id}`}
                  name="greetingCard"
                  value={card.id}
                  checked={selectedCardId === card.id}
                  onChange={() => handleCardChange(card.id)}
                  className={styles.radioInput}
                  disabled={isSending}
                />
                <label htmlFor={`card-${card.id}`} className={styles.cardOption}>
                  <span className={styles.cardIcon}>{card.icon}</span>
                  <span className={styles.cardName}>{card.shortName}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Personal message */}
          <p><strong>{config.subtitlePopup}</strong></p>
          <textarea
            className={styles.textarea}
            placeholder="Escribe tu mensaje personal..."
            value={message}
            onChange={e => {
              setMessage(e.target.value);
              setValidationError(null);
            }}
            disabled={isSending}
            maxLength={500}
            rows={4}
          />
          <p className={styles.charCount}>{message.length}/500</p>

          {/* Validation / send errors */}
          {validationError && (
            <p className={styles.errorMsg} role="alert">{validationError}</p>
          )}
          {sendError && (
            <p className={styles.errorMsg} role="alert">{sendError}</p>
          )}

          {/* Actions */}
          <div className={styles.buttons}>
            <button
              className={styles.btnCancel}
              onClick={onClose}
              disabled={isSending}
            >
              {config.buttonCancel}
            </button>
            <button
              className={styles.btnSend}
              onClick={handleSend}
              disabled={isSending}
            >
              {isSending ? 'Enviando...' : config.buttonSend}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GreetingModal;
