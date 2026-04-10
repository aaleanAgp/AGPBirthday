import { IBirthdayConfig } from '../models/BirthdayConfig';
import { ISharePointRepository } from '../repositories/SharePointRepository';

interface IConfigItem {
  Id: number;
  Title: string;   // The key, e.g. TEXT_TITLE_SLIDER
  Valor: string;   // SUPUESTO: value column is named "Valor"
}

// Sensible defaults used when the list is unreachable or a key is missing
export const DEFAULT_CONFIG: IBirthdayConfig = {
  titleSlider: 'Próximos Cumpleaños',
  subtitleSlider: '¡Celebremos juntos!',
  linkSlider: '',
  titlePopup: '¡Envía un saludo!',
  subtitlePopup: 'Elige una tarjeta y escribe tu mensaje',
  descriptionPopup: 'Tu saludo llegará al cumpleañero por correo.',
  emailPopup: '',
  buttonCancel: 'Cancelar',
  buttonSend: 'Enviar saludo',
  buttonSlider: 'Ver todos',
  validateCard: 'Por favor selecciona una tarjeta.',
  validateMessage: 'Por favor escribe un mensaje.',
  messageSuccess: '¡Saludo enviado con éxito!',
  messageWarning: 'No se pudo enviar el saludo. Intenta de nuevo.',
  numberOfBirthdays: 10
};

export interface IConfigService {
  getConfig(): Promise<IBirthdayConfig>;
}

export class ConfigService implements IConfigService {
  constructor(
    private readonly repository: ISharePointRepository,
    private readonly listName: string
  ) {}

  async getConfig(): Promise<IBirthdayConfig> {
    try {
      const items = await this.repository.getListItems<IConfigItem>(
        this.listName,
        ['Title', 'Valor']
      );

      const map: Record<string, string> = {};
      items.forEach(item => { map[item.Title] = item.Valor; });

      const get = (key: string, fallback: string): string => map[key] ?? fallback;
      const getNum = (key: string, fallback: number): number => {
        const raw = map[key];
        const parsed = raw !== undefined ? parseInt(raw, 10) : NaN;
        return isNaN(parsed) ? fallback : parsed;
      };

      return {
        titleSlider:       get('TEXT_TITLE_SLIDER',       DEFAULT_CONFIG.titleSlider),
        subtitleSlider:    get('TEXT_SUBTITLE_SLIDER',    DEFAULT_CONFIG.subtitleSlider),
        linkSlider:        get('TEXT_LINK_SLIDER',        DEFAULT_CONFIG.linkSlider),
        titlePopup:        get('TEXT_TITLE_POPUP',        DEFAULT_CONFIG.titlePopup),
        subtitlePopup:     get('TEXT_SUBTITLE_POPUP',     DEFAULT_CONFIG.subtitlePopup),
        descriptionPopup:  get('TEXT_DESCRIPTION_POPUP',  DEFAULT_CONFIG.descriptionPopup),
        emailPopup:        get('TEXT_EMAIL_POPUP',        DEFAULT_CONFIG.emailPopup),
        buttonCancel:      get('TEXT_BUTTON_CANCEL',      DEFAULT_CONFIG.buttonCancel),
        buttonSend:        get('TEXT_BUTTON_SEND',        DEFAULT_CONFIG.buttonSend),
        buttonSlider:      get('TEXT_BUTTON_SLIDER',      DEFAULT_CONFIG.buttonSlider),
        validateCard:      get('TEXT_VALIDATE_CARD',      DEFAULT_CONFIG.validateCard),
        validateMessage:   get('TEXT_VALIDATE_MESSAGE',   DEFAULT_CONFIG.validateMessage),
        messageSuccess:    get('TEXT_MSJ_SUCCESS',        DEFAULT_CONFIG.messageSuccess),
        messageWarning:    get('TEXT_MSJ_WARNING',        DEFAULT_CONFIG.messageWarning),
        numberOfBirthdays: getNum('NUMBER_BIRHTDAY',      DEFAULT_CONFIG.numberOfBirthdays)
      };
    } catch (err) {
      console.warn('[ConfigService] Could not load from SharePoint, using defaults:', err);
      return DEFAULT_CONFIG;
    }
  }
}

export class MockConfigService implements IConfigService {
  async getConfig(): Promise<IBirthdayConfig> {
    return { ...DEFAULT_CONFIG };
  }
}
