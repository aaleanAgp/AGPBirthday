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
  cardTemplateId: number;
  message: string;
  sentDate: Date;
}
