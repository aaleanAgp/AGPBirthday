import { IBirthdayConfig } from '../models/BirthdayConfig';
import { ISharePointRepository } from '../repositories/SharePointRepository';
import { isAbsoluteOrRootUrl, resolveSiteUrlValue } from '../utils/siteUrlUtils';

interface IConfigItem {
  Id: number;
  Title?: string;
  Codigo?: string;
  Valor?: string;
  ['Valor_x0028_Texto_x0020_Enriquecido_x0029']?: string;
  ['Valor0']?: string;
  ['ValorTextoEnriquecido']?: string;
}

export const DEFAULT_CONFIG: IBirthdayConfig = {
  titleSlider: 'Cumpleanos AGPEOPLE',
  subtitleSlider: 'Felicidades a nuestros proximos cumpleaneros. Conocelos aqui:',
  linkSlider: '',
  titlePopup: 'Envia un saludo',
  subtitlePopup: 'Elige una tarjeta y escribe tu mensaje',
  descriptionPopup: 'Tu saludo llegara al cumpleanero por correo.',
  emailPopup: '',
  buttonCancel: 'Cancelar',
  buttonSend: '¡Enviar un saludo!',
  buttonSlider: 'Ver todos los cumpleanos',
  validateCard: 'Por favor selecciona una tarjeta.',
  validateMessage: 'Por favor escribe un mensaje.',
  messageSuccess: '¡Saludo enviado con exito!',
  messageWarning: 'No se pudo enviar el saludo. Intenta de nuevo.',
  numberOfBirthdays: 10,
  titleAll: 'Todos los cumpleaños',
  subtitleAll: 'Consulta y encuentra a cualquier cumpleañero del año.',
  linkBack: 'Volver',
  startDateAll: 'Fecha inicial',
  endDateAll: 'Fecha final',
  buttonSearchAll: 'Buscar',
  searchLabelAll: 'Buscar cumpleañero',
  searchPlaceholderAll: 'Nombre, correo o cargo'
};

export interface IConfigService {
  getConfig(): Promise<IBirthdayConfig>;
}

export class ConfigService implements IConfigService {
  constructor(
    private readonly repository: ISharePointRepository,
    private readonly listName: string,
    private readonly siteUrl: string
  ) { }

  async getConfig(): Promise<IBirthdayConfig> {
    try {
      const items = await this.repository.getListItems<IConfigItem>(
        this.listName
      );

      const map: Record<string, string> = {};
      items.forEach(item => {
        const key = (item.Codigo || item.Title || '').trim();
        const rawValue = this._resolveConfigValue(item);
        if (key) {
          map[key] = rawValue;
        }
      });

      const get = (key: string, fallback: string): string => map[key] ?? fallback;
      const getNum = (key: string, fallback: number): number => {
        const raw = map[key];
        const parsed = raw !== undefined ? parseInt(raw, 10) : NaN;
        return isNaN(parsed) ? fallback : parsed;
      };
      const getText = (key: string, fallback: string): string => {
        const raw = get(key, fallback);
        return this._normalizeRichText(raw, fallback);
      };

      const rawLinkSlider = get('TEXT_LINK_SLIDER', DEFAULT_CONFIG.linkSlider);
      const rawLinkSliderUrl = get('TEXT_LINK_SLIDER_URL', DEFAULT_CONFIG.linkSlider);
      const resolvedLinkSlider = resolveSiteUrlValue(
        this.siteUrl,
        isAbsoluteOrRootUrl(rawLinkSlider) ? rawLinkSlider : rawLinkSliderUrl,
        'SitePages/BirthdayAll.aspx'
      );
      const resolvedButtonSlider = getText(
        'TEXT_LINK_SLIDER',
        !isAbsoluteOrRootUrl(rawLinkSlider) && rawLinkSlider
          ? rawLinkSlider
          : DEFAULT_CONFIG.buttonSlider
      );

      return {
        titleSlider: getText('TEXT_TITLE_SLIDER', DEFAULT_CONFIG.titleSlider),
        subtitleSlider: getText('TEXT_SUBTITLE_SLIDER', DEFAULT_CONFIG.subtitleSlider),
        linkSlider: resolvedLinkSlider,
        titlePopup: getText('TEXT_TITLE_POPUP', DEFAULT_CONFIG.titlePopup),
        subtitlePopup: getText('TEXT_SUBTITLE_POPUP', DEFAULT_CONFIG.subtitlePopup),
        descriptionPopup: getText('TEXT_DESCRIPTION_POPUP', DEFAULT_CONFIG.descriptionPopup),
        emailPopup: getText('TEXT_EMAIL_POPUP', DEFAULT_CONFIG.emailPopup),
        buttonCancel: getText('TEXT_BUTTON_CANCEL', DEFAULT_CONFIG.buttonCancel),
        buttonSend: getText('TEXT_BUTTON_SEND', DEFAULT_CONFIG.buttonSend),
        buttonSlider: resolvedButtonSlider,
        validateCard: getText('TEXT_VALIDATE_CARD', DEFAULT_CONFIG.validateCard),
        validateMessage: getText('TEXT_VALIDATE_MESSAGE', DEFAULT_CONFIG.validateMessage),
        messageSuccess: getText('TEXT_MSJ_SUCCESS', DEFAULT_CONFIG.messageSuccess),
        messageWarning: getText('TEXT_MSJ_WARNING', DEFAULT_CONFIG.messageWarning),
        numberOfBirthdays: getNum('NUMBER_BIRHTDAY', DEFAULT_CONFIG.numberOfBirthdays),
        titleAll: getText('TEXT_TITLE_ALL', DEFAULT_CONFIG.titleAll),
        subtitleAll: getText('TEXT_SUBTITLE_ALL', DEFAULT_CONFIG.subtitleAll),
        linkBack: getText('TEXT_LINK_BACK', DEFAULT_CONFIG.linkBack),
        startDateAll: getText('TEXT_STARTDATE_ALL', DEFAULT_CONFIG.startDateAll),
        endDateAll: getText('TEXT_ENDDATE_ALL', DEFAULT_CONFIG.endDateAll),
        buttonSearchAll: getText('TEXT_BUTTON_SEARCH', DEFAULT_CONFIG.buttonSearchAll),
        searchLabelAll: getText('TEXT_SEARCH_LABEL_ALL', DEFAULT_CONFIG.searchLabelAll),
        searchPlaceholderAll: getText('TEXT_SEARCH_PLACEHOLDER_ALL', DEFAULT_CONFIG.searchPlaceholderAll)
      };
    } catch (err) {
      console.warn('[ConfigService] Could not load from SharePoint, using defaults:', err);
      return {
        ...DEFAULT_CONFIG,
        linkSlider: resolveSiteUrlValue(this.siteUrl, '', 'SitePages/BirthdayAll.aspx')
      };
    }
  }

  private _resolveConfigValue(item: IConfigItem): string {
    return (
      item.Valor ||
      item['Valor_x0028_Texto_x0020_Enriquecido_x0029'] ||
      item.Valor0 ||
      item.ValorTextoEnriquecido ||
      ''
    ).trim();
  }

  private _normalizeRichText(value: string, fallback: string): string {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return fallback;
    }

    const withoutTags = trimmed
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');

    const decoded = withoutTags
      .replace(/&#160;|&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(parseInt(code, 10)))
      .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(parseInt(code, 16)))
      .replace(/\s+/g, ' ')
      .trim();

    return decoded || fallback;
  }
}

export class MockConfigService implements IConfigService {
  constructor(private readonly siteUrl: string = '') { }

  async getConfig(): Promise<IBirthdayConfig> {
    return {
      ...DEFAULT_CONFIG,
      linkSlider: resolveSiteUrlValue(this.siteUrl, '', 'SitePages/BirthdayAll.aspx')
    };
  }
}
