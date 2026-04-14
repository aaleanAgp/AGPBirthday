import { IGreetingAudit } from '../models/GreetingAudit';
import { ISharePointRepository } from '../repositories/SharePointRepository';

export interface IAuditService {
  recordGreeting(audit: IGreetingAudit): Promise<void>;
}

/**
 * Writes a greeting audit record to the legacy "Auditoria" SharePoint list.
 *
 * Expected legacy columns:
 *   Title (shown as "Ver Detalle"), RemitenteId, DestinatarioId,
 *   Fecha, IdTarjetaId, Mensaje, Enviado, CuerpoCorreo
 */
export class AuditService implements IAuditService {
  constructor(
    private readonly repository: ISharePointRepository,
    private readonly listName: string
  ) {}

  async recordGreeting(audit: IGreetingAudit): Promise<void> {
    const item: Record<string, unknown> = {
      Title: 'Ver Detalle',
      Fecha: audit.sentDate.toISOString(),
      IdTarjetaId: audit.cardTemplateId,
      Mensaje: audit.message,
      Enviado: true,
      CuerpoCorreo: audit.mailBody
    };

    if (audit.senderSiteUserId) {
      item.RemitenteId = audit.senderSiteUserId;
    } else {
      item.Remitente = audit.senderName || audit.senderEmail;
    }

    if (audit.recipientLookupId) {
      item.DestinatarioId = audit.recipientLookupId;
    } else {
      item.Destinatario = audit.recipientName;
    }

    await this.repository.addListItem(this.listName, item);
  }
}

export class MockAuditService implements IAuditService {
  async recordGreeting(audit: IGreetingAudit): Promise<void> {
    console.log('[MockAuditService] Audit record (not persisted):', audit);
  }
}
