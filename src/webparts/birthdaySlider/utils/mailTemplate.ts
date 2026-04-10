import { IGreetingCardTemplate } from '../models/GreetingCardTemplate';

export interface IMailContent {
  subject: string;
  body: string;
  toEmail: string;
  toName: string;
  fromEmail: string;
}

/**
 * Merges a card template with recipient info and a personal message
 * to produce the final email content.
 *
 * Supported template variables (case-insensitive):
 *   {nombre}  → recipient's full name
 *   {mensaje} → personal message written by the sender
 *
 * TODO: Confirm actual variable names used in Tarjeta list with the
 * business team. The legacy system may use different placeholders.
 */
export function buildMailContent(
  card: IGreetingCardTemplate,
  recipientName: string,
  recipientEmail: string,
  senderEmail: string,
  personalMessage: string
): IMailContent {
  const replace = (template: string): string =>
    template
      .replace(/\{nombre\}/gi, recipientName)
      .replace(/\{mensaje\}/gi, personalMessage);

  return {
    subject: replace(card.subject),
    body: replace(card.body),
    toEmail: recipientEmail,
    toName: recipientName,
    fromEmail: senderEmail
  };
}
