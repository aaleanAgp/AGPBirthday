import { IGraphMailClient } from '../graph/GraphMailClient';
import { IAuditService } from './AuditService';
import { IBirthdayPerson } from '../models/BirthdayPerson';
import { IGreetingCardTemplate } from '../models/GreetingCardTemplate';
import { buildMailContent } from '../utils/mailTemplate';

export interface IGreetingPayload {
  recipient: IBirthdayPerson;
  card: IGreetingCardTemplate;
  personalMessage: string;
  senderEmail: string;
}

export interface IGreetingService {
  sendGreeting(payload: IGreetingPayload): Promise<void>;
}

/**
 * Orchestrates the greeting flow:
 *   1. Builds the mail content from the card template + recipient info.
 *   2. Sends via Microsoft Graph.
 *   3. Records the audit (non-blocking — audit failures do not fail the send).
 */
export class GreetingService implements IGreetingService {
  constructor(
    private readonly mailClient: IGraphMailClient,
    private readonly auditService: IAuditService
  ) {}

  async sendGreeting(payload: IGreetingPayload): Promise<void> {
    const { recipient, card, personalMessage, senderEmail } = payload;

    const mail = buildMailContent(card, recipient.name, recipient.email, senderEmail, personalMessage);

    await this.mailClient.sendMail({
      subject: mail.subject,
      body: mail.body,
      toEmail: mail.toEmail,
      toName: mail.toName
    });

    // Fire-and-forget: audit should not block or fail the greeting
    this.auditService
      .recordGreeting({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        senderEmail,
        cardTemplateId: card.id,
        message: personalMessage,
        sentDate: new Date()
      })
      .catch(err => console.warn('[GreetingService] Audit write failed (non-critical):', err));
  }
}
