import * as React from 'react';
import { useState } from 'react';
import { IBirthdayPerson } from '../models/BirthdayPerson';
import { IBirthdayConfig } from '../models/BirthdayConfig';
import { IGreetingCardTemplate } from '../models/GreetingCardTemplate';
import { getProfilePhotoUrl, getFallbackPhotoUrl } from '../utils/photoUtils';
import { formatBirthdayDate } from '../utils/dateUtils';
import { buildSiteRelativeUrl } from '../utils/siteUrlUtils';
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
    : getProfilePhotoUrl(person.email, siteUrl, 'L');

  const selectedCard = cardTemplates.find(c => c.id === selectedCardId) || null;
  const bannerUrl = buildSiteRelativeUrl(siteUrl, 'Recursos/images/banner1.jpg');

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

        <button
          className={styles.closeButton}
          onClick={onClose}
          disabled={isSending}
          aria-label="Cerrar"
        >
          ×
        </button>

        <img
          src={bannerUrl}
          alt="Banner de cumpleanos"
          className={styles.modalBanner}
        />

        <div className={styles.body}>

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
                <p>{config.emailPopup} {person.email}</p>
              </div>
            </div>
          </div>

          <h4 className={styles.sectionTitle}>{config.titlePopup}</h4>

          <p className={styles.messageLabel}>{config.subtitlePopup}</p>
          <div className={styles.textareaWrapper}>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                setValidationError(null);
              }}
              disabled={isSending}
              maxLength={500}
              rows={4}
            />
          </div>

          <p className={styles.messageLabel}>{config.descriptionPopup}</p>
          <div className={styles.cardOptions}>
            {cardTemplates.map(card => (
              <label
                key={card.id}
                htmlFor={`card-${card.id}`}
                className={styles.cardOptionWrapper}
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
                <span className={styles.cardOption}>
                  <span className={styles.radioCustom} />
                  <span className={styles.cardIcon}>
                    {(card.icon.startsWith('http') || card.icon.startsWith('/')) ? (
                      <img src={card.icon} alt="" />
                    ) : (
                      card.icon
                    )}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {validationError && (
            <p className={styles.errorMsg} role="alert">{validationError}</p>
          )}
          {sendError && (
            <p className={styles.errorMsg} role="alert">{sendError}</p>
          )}

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

