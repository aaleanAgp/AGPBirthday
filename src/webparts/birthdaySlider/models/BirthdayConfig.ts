/**
 * Configuration loaded from the "Configuracion" SharePoint list.
 * Each entry has a Title (key) and a Valor (value).
 *
 * Key mapping:
 *   titleSlider       ← TEXT_TITLE_SLIDER
 *   subtitleSlider    ← TEXT_SUBTITLE_SLIDER
 *   linkSlider        ← TEXT_LINK_SLIDER
 *   titlePopup        ← TEXT_TITLE_POPUP
 *   subtitlePopup     ← TEXT_SUBTITLE_POPUP
 *   descriptionPopup  ← TEXT_DESCRIPTION_POPUP
 *   emailPopup        ← TEXT_EMAIL_POPUP
 *   buttonCancel      ← TEXT_BUTTON_CANCEL
 *   buttonSend        ← TEXT_BUTTON_SEND
 *   buttonSlider      ← TEXT_BUTTON_SLIDER
 *   validateCard      ← TEXT_VALIDATE_CARD
 *   validateMessage   ← TEXT_VALIDATE_MESSAGE
 *   messageSuccess    ← TEXT_MSJ_SUCCESS
 *   messageWarning    ← TEXT_MSJ_WARNING
 *   numberOfBirthdays ← NUMBER_BIRHTDAY (note: legacy typo preserved as-is)
 */
export interface IBirthdayConfig {
  titleSlider: string;
  subtitleSlider: string;
  linkSlider: string;
  titlePopup: string;
  subtitlePopup: string;
  descriptionPopup: string;
  emailPopup: string;
  buttonCancel: string;
  buttonSend: string;
  buttonSlider: string;
  validateCard: string;
  validateMessage: string;
  messageSuccess: string;
  messageWarning: string;
  numberOfBirthdays: number;
}
