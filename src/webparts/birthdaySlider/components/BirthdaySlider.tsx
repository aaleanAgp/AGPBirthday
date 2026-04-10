import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { IBirthdaySliderProps } from './IBirthdaySliderProps';
import BirthdayHeader from './BirthdayHeader';
import BirthdayCarousel from './BirthdayCarousel';
import GreetingModal from './GreetingModal';
import LoaderOverlay from './LoaderOverlay';
import EmptyState from './EmptyState';
import { IBirthdayPerson } from '../models/BirthdayPerson';
import { IBirthdayConfig } from '../models/BirthdayConfig';
import { IGreetingCardTemplate } from '../models/GreetingCardTemplate';
import styles from '../styles/BirthdaySlider.module.scss';

interface IState {
  loading: boolean;
  sending: boolean;
  people: IBirthdayPerson[];
  config: IBirthdayConfig | null;
  cardTemplates: IGreetingCardTemplate[];
  selectedPerson: IBirthdayPerson | null;
  modalOpen: boolean;
  error: string | null;
  successMessage: string | null;
}

const INITIAL_STATE: IState = {
  loading: true,
  sending: false,
  people: [],
  config: null,
  cardTemplates: [],
  selectedPerson: null,
  modalOpen: false,
  error: null,
  successMessage: null
};

/**
 * Root component for the Birthday Slider web part.
 *
 * Responsibilities:
 *   - Loads data in parallel (config, people, card templates) on mount
 *   - Manages modal open/close and sending state
 *   - Delegates rendering to specialised child components
 *   - Delegates business logic to injected services (from WebPart class)
 */
const BirthdaySlider: React.FC<IBirthdaySliderProps> = (props) => {
  const [state, setState] = useState<IState>(INITIAL_STATE);

  const {
    birthdayService,
    configService,
    cardTemplateService,
    greetingService,
    siteUrl,
    context
  } = props;

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        setState(s => ({ ...s, loading: true, error: null }));

        const [config, people, cardTemplates] = await Promise.all([
          configService.getConfig(),
          birthdayService.getUpcomingBirthdays(),
          cardTemplateService.getActiveTemplates()
        ]);

        if (cancelled) return;

        // If config provides the limit, re-fetch people with the correct cap
        // (or simply slice here for the MVP)
        const limitedPeople = people.slice(0, config.numberOfBirthdays);

        setState(s => ({
          ...s,
          loading: false,
          config,
          people: limitedPeople,
          cardTemplates
        }));
      } catch (err) {
        if (cancelled) return;
        console.error('[BirthdaySlider] Failed to load data:', err);
        setState(s => ({
          ...s,
          loading: false,
          error: 'No se pudo cargar la información de cumpleaños. Por favor intente más tarde.'
        }));
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGreetClick = useCallback((person: IBirthdayPerson): void => {
    setState(s => ({
      ...s,
      selectedPerson: person,
      modalOpen: true,
      successMessage: null
    }));
  }, []);

  const handleModalClose = useCallback((): void => {
    setState(s => ({ ...s, modalOpen: false, selectedPerson: null }));
  }, []);

  const handleGreetingSend = useCallback(async (
    card: IGreetingCardTemplate,
    message: string
  ): Promise<void> => {
    const { selectedPerson, config } = state;
    if (!selectedPerson || !config) return;

    // TODO: Use context.pageContext.user.email for the actual sender.
    // Falls back to emailPopup from config if user email unavailable (local workbench).
    const senderEmail: string =
      (context.pageContext && context.pageContext.user && context.pageContext.user.email)
        ? context.pageContext.user.email
        : (config.emailPopup || '');

    setState(s => ({ ...s, sending: true }));

    try {
      await greetingService.sendGreeting({
        recipient: selectedPerson,
        card,
        personalMessage: message,
        senderEmail
      });

      setState(s => ({
        ...s,
        sending: false,
        modalOpen: false,
        selectedPerson: null,
        successMessage: config.messageSuccess
      }));

      // Auto-dismiss success banner after 5 seconds
      setTimeout(() => setState(s => ({ ...s, successMessage: null })), 5000);
    } catch (err) {
      setState(s => ({ ...s, sending: false }));
      throw err; // Propagate to modal so it can show the warning message
    }
  }, [state.selectedPerson, state.config, greetingService, context]);

  // ── Render ────────────────────────────────────────────────────────────────
  const { loading, error, config, people, cardTemplates, modalOpen, selectedPerson, sending, successMessage } = state;

  if (loading) {
    return (
      <div className={styles.birthdaySlider}>
        <LoaderOverlay />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className={styles.birthdaySlider}>
        <EmptyState message={error || 'Error de configuración.'} />
      </div>
    );
  }

  return (
    <div className={styles.birthdaySlider}>
      <BirthdayHeader
        title={config.titleSlider}
        subtitle={config.subtitleSlider}
        linkText={config.buttonSlider}
        linkUrl={config.linkSlider}
      />

      {successMessage && (
        <div className={styles.successBanner} role="status">
          {successMessage}
        </div>
      )}

      {people.length === 0 ? (
        <EmptyState message="No hay próximos cumpleaños registrados." />
      ) : (
        <BirthdayCarousel
          people={people}
          siteUrl={siteUrl}
          onGreetClick={handleGreetClick}
        />
      )}

      {modalOpen && selectedPerson && (
        <GreetingModal
          person={selectedPerson}
          config={config}
          cardTemplates={cardTemplates}
          siteUrl={siteUrl}
          isSending={sending}
          onClose={handleModalClose}
          onSend={handleGreetingSend}
        />
      )}
    </div>
  );
};

export default BirthdaySlider;
