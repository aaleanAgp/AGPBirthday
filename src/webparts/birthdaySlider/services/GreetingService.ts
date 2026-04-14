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
  senderName: string;
  senderSiteUserId?: number;
}

export interface IGreetingService {
  sendGreeting(payload: IGreetingPayload): Promise<void>;
}

export class GreetingService implements IGreetingService {
  constructor(
    private readonly mailClient: IGraphMailClient,
    private readonly auditService: IAuditService
  ) {}

  async sendGreeting(payload: IGreetingPayload): Promise<void> {
    const { recipient, card, personalMessage, senderEmail, senderName, senderSiteUserId } = payload;

    const mail = buildMailContent(
      card,
      recipient.name,
      recipient.email,
      senderName,
      senderEmail,
      personalMessage
    );

    await this.mailClient.sendMail({
      subject: mail.subject,
      body: mail.body,
      toEmail: mail.toEmail,
      toName: mail.toName
    });

    this.auditService
      .recordGreeting({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        senderEmail,
        senderName,
        senderSiteUserId,
        recipientLookupId: recipient.id,
        cardTemplateId: card.id,
        message: personalMessage,
        mailBody: mail.body,
        sentDate: new Date()
      })
      .catch(err => console.warn('[GreetingService] Audit write failed (non-critical):', err));
  }
}
