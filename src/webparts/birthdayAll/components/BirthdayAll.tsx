import * as React from 'react';
import { useEffect, useState } from 'react';
import { IBirthdayAllProps } from './IBirthdayAllProps';
import BirthdayAllCard from './BirthdayAllCard';
import EmptyState from '../../birthdaySlider/components/EmptyState';
import LoaderOverlay from '../../birthdaySlider/components/LoaderOverlay';
import { IBirthdayConfig } from '../../birthdaySlider/models/BirthdayConfig';
import { IBirthdayPerson } from '../../birthdaySlider/models/BirthdayPerson';
import { filterBirthdays, parseDayMonthInput } from '../../birthdaySlider/utils/birthdayAllFilters';
import styles from '../styles/BirthdayAll.module.scss';

interface IState {
  loading: boolean;
  people: IBirthdayPerson[];
  config: IBirthdayConfig | null;
  error: string | null;
}

const PAGE_SIZE = 9;
const INITIAL_STATE: IState = {
  loading: true,
  people: [],
  config: null,
  error: null
};

const BirthdayAll: React.FC<IBirthdayAllProps> = ({
  birthdayService,
  configService,
  siteUrl
}) => {
  const [state, setState] = useState<IState>(INITIAL_STATE);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');
  const [appliedStartDate, setAppliedStartDate] = useState<string>('');
  const [appliedEndDate, setAppliedEndDate] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        setState(previous => ({ ...previous, loading: true, error: null }));

        const config = await configService.getConfig();
        const people = await birthdayService.getAllBirthdays();

        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          people,
          config,
          error: null
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error('[BirthdayAll] Failed to load data:', error);
        const fallbackConfig = await configService.getConfig().catch(() => null);
        setState({
          loading: false,
          people: [],
          config: fallbackConfig,
          error: 'No se pudo cargar la lista completa de cumpleanos.'
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [birthdayService, configService]);

  const parsedStartDate = parseDayMonthInput(appliedStartDate);
  const parsedEndDate = parseDayMonthInput(appliedEndDate);

  const filteredPeople = filterBirthdays(
    state.people,
    searchTerm,
    parsedStartDate,
    parsedEndDate
  );

  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentPeople = filteredPeople.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleApplyFilters = (): void => {
    const startCandidate = startDateInput.trim();
    const endCandidate = endDateInput.trim();

    if (startCandidate && !parseDayMonthInput(startCandidate)) {
      setValidationError(state.config?.errorDateAll || 'La fecha debe tener formato dd/mm.');
      return;
    }

    if (endCandidate && !parseDayMonthInput(endCandidate)) {
      setValidationError(state.config?.errorDateAll || 'La fecha debe tener formato dd/mm.');
      return;
    }

    setValidationError(null);
    setAppliedStartDate(startCandidate);
    setAppliedEndDate(endCandidate);
    setCurrentPage(1);
  };

  const handleClearFilters = (): void => {
    setStartDateInput('');
    setEndDateInput('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setValidationError(null);
    setCurrentPage(1);
  };

  const handleGoBack = (): void => {
    const referrer = document.referrer || '';

    if (referrer && referrer.indexOf(window.location.origin) === 0) {
      window.location.href = referrer;
      return;
    }

    window.location.href = siteUrl;
  };

  if (state.loading) {
    return (
      <div className={styles.birthdayAll}>
        <LoaderOverlay />
      </div>
    );
  }

  if (!state.config) {
    return (
      <div className={styles.birthdayAll}>
        <EmptyState message="No se encontro configuracion para la vista completa." />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.birthdayAll}>
        <EmptyState message={state.error} />
      </div>
    );
  }

  return (
    <div className={styles.birthdayAll}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <button type="button" className={styles.backLink} onClick={handleGoBack}>
            {state.config.linkBack}
          </button>
          <h2 className={styles.title}>{state.config.titleAll}</h2>
          <p className={styles.subtitle}>{state.config.subtitleAll}</p>
        </div>
      </section>

      <section className={styles.filters}>
        <div className={styles.filterBlock}>
          <label className={styles.label} htmlFor="birthday-all-search">
            {state.config.searchLabelAll}
          </label>
          <input
            id="birthday-all-search"
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className={styles.input}
            placeholder={state.config.searchPlaceholderAll}
          />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterBlock}>
            <label className={styles.label} htmlFor="birthday-all-start">
              {state.config.startDateAll}
            </label>
            <input
              id="birthday-all-start"
              type="text"
              inputMode="numeric"
              value={startDateInput}
              onChange={(event) => setStartDateInput(event.target.value)}
              className={styles.input}
              placeholder="dd/mm"
            />
          </div>

          <div className={styles.filterBlock}>
            <label className={styles.label} htmlFor="birthday-all-end">
              {state.config.endDateAll}
            </label>
            <input
              id="birthday-all-end"
              type="text"
              inputMode="numeric"
              value={endDateInput}
              onChange={(event) => setEndDateInput(event.target.value)}
              className={styles.input}
              placeholder="dd/mm"
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <button type="button" className={styles.primaryButton} onClick={handleApplyFilters}>
            {state.config.buttonSearchAll}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={handleClearFilters}>
            {state.config.buttonClearAll}
          </button>
        </div>

        {validationError && (
          <p className={styles.validationMessage} role="alert">
            {validationError}
          </p>
        )}
      </section>

      <section className={styles.resultsHeader}>
        <p className={styles.resultsText}>
          {filteredPeople.length} {state.config.resultsCountSuffixAll}
        </p>
        {(appliedStartDate || appliedEndDate || searchTerm.trim()) && (
          <p className={styles.resultsHint}>
            Busqueda activa sobre nombre, correo, cargo y rango de fechas.
          </p>
        )}
      </section>

      {filteredPeople.length === 0 ? (
        <EmptyState message="No se encontraron cumpleaneros con los filtros actuales." />
      ) : (
        <>
          <div className={styles.grid}>
            {currentPeople.map(person => (
              <BirthdayAllCard key={person.id} person={person} siteUrl={siteUrl} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Paginacion de cumpleanos">
              <button
                type="button"
                className={styles.pageButton}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {state.config.paginationPreviousAll}
              </button>

              <span className={styles.pageStatus}>
                Pagina {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                className={styles.pageButton}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {state.config.paginationNextAll}
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default BirthdayAll;
