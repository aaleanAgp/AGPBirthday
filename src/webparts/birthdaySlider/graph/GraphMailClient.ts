import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

export interface IMailMessage {
  subject: string;
  body: string;
  toEmail: string;
  toName: string;
}

export interface IGraphMailClient {
  sendMail(message: IMailMessage): Promise<void>;
}

/**
 * Sends an email via Microsoft Graph /me/sendMail (delegated permission).
 *
 * PREREQUISITE: The following API permission must be approved in the
 * SharePoint admin center → API access page:
 *   Microsoft Graph → Mail.Send
 *
 * The email is sent AS the currently logged-in user.
 * The mail is NOT saved to Sent Items (saveToSentItems: false).
 *
 * TODO: Confirm with tenant admin that Mail.Send has been approved.
 */
export class GraphMailClient implements IGraphMailClient {
  constructor(private readonly context: WebPartContext) {}

  async sendMail(message: IMailMessage): Promise<void> {
    const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');

    const payload = {
      message: {
        subject: message.subject,
        body: {
          contentType: 'HTML',
          content: message.body
        },
        toRecipients: [
          {
            emailAddress: {
              address: message.toEmail,
              name: message.toName
            }
          }
        ]
      },
      saveToSentItems: false
    };

    await client.api('/me/sendMail').post(payload);
  }
}

/**
 * Mock implementation — simulates a send without calling Graph.
 * Use during development until Mail.Send permission is approved.
 */
export class MockGraphMailClient implements IGraphMailClient {
  async sendMail(message: IMailMessage): Promise<void> {
    console.log('[MockGraphMailClient] Simulating email send:', message);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    console.log('[MockGraphMailClient] Done — would have sent to:', message.toEmail);
  }
}
