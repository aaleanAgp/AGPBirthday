import { IGreetingCardTemplate } from '../models/GreetingCardTemplate';

export interface IMailContent {
  subject: string;
  body: string;
  toEmail: string;
  toName: string;
  fromEmail: string;
}

export function buildMailContent(
  card: IGreetingCardTemplate,
  recipientName: string,
  recipientEmail: string,
  senderName: string,
  senderEmail: string,
  personalMessage: string
): IMailContent {
  const senderNameUpper = (senderName || '').toUpperCase();
  const replace = (template: string): string =>
    template
      .replace(/\{nombre\}/gi, recipientName)
      .replace(/\{mensaje\}/gi, personalMessage)
      .replace(/\{remitente\}/gi, senderNameUpper)
      .replace(/\{correoRemitente\}/gi, senderEmail)
      .replace(/\{destinatario\}/gi, recipientName)
      .replace(/\{correoDestinatario\}/gi, recipientEmail)
      .replace(/\[From\]/gi, senderNameUpper)
      .replace(/\[FromEmail\]/gi, senderEmail)
      .replace(/\[To\]/gi, recipientName)
      .replace(/\[ToEmail\]/gi, recipientEmail)
      .replace(/\[Message\]/gi, personalMessage);

  return {
    subject: replace(card.subject),
    body: replace(card.body),
    toEmail: recipientEmail,
    toName: recipientName,
    fromEmail: senderEmail
  };
}
