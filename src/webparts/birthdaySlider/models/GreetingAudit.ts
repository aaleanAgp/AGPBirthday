export interface IGreetingAudit {
  recipientName: string;
  recipientEmail: string;
  senderEmail: string;
  senderName: string;
  senderSiteUserId?: number;
  recipientLookupId: number;
  cardTemplateId: number;
  message: string;
  mailBody: string;
  sentDate: Date;
}
