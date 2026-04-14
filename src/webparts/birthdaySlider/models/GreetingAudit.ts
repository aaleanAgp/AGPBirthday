/**
 * Audit record stored in the "Auditoria" SharePoint list
 * every time a greeting email is successfully sent.
 *
 * SUPUESTO: column names in Auditoria list are assumed.
 * Confirm with SharePoint admin before deploying.
 */
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
