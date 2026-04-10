import { IGreetingAudit } from '../models/GreetingAudit';
import { ISharePointRepository } from '../repositories/SharePointRepository';

export interface IAuditService {
  recordGreeting(audit: IGreetingAudit): Promise<void>;
}

/**
 * Writes a greeting audit record to the "Auditoria" SharePoint list.
 *
 * SUPUESTO: column names are:
 *   Title, NombreDestinatario, CorreoDestinatario, CorreoRemitente,
 *   IdTarjeta, Mensaje, FechaEnvio
 *
 * Confirm with SharePoint admin before production deploy.
 */
export class AuditService implements IAuditService {
  constructor(
    private readonly repository: ISharePointRepository,
    private readonly listName: string
  ) {}

  async recordGreeting(audit: IGreetingAudit): Promise<void> {
    await this.repository.addListItem(this.listName, {
      Title: `Saludo a ${audit.recipientName} — ${audit.sentDate.toISOString().substring(0, 10)}`,
      NombreDestinatario: audit.recipientName,
      CorreoDestinatario: audit.recipientEmail,
      CorreoRemitente: audit.senderEmail,
      IdTarjeta: audit.cardTemplateId,
      Mensaje: audit.message,
      FechaEnvio: audit.sentDate.toISOString()
    });
  }
}

export class MockAuditService implements IAuditService {
  async recordGreeting(audit: IGreetingAudit): Promise<void> {
    console.log('[MockAuditService] Audit record (not persisted):', audit);
  }
}
