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
      saveToSentItems: true
    };

    await client.api('/me/sendMail').post(payload);
  }
}

export class MockGraphMailClient implements IGraphMailClient {
  async sendMail(message: IMailMessage): Promise<void> {
    console.log('[MockGraphMailClient] Simulating email send:', message);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    console.log('[MockGraphMailClient] Done — would have sent to:', message.toEmail);
  }
}
