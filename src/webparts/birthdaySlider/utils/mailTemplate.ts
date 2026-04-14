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
