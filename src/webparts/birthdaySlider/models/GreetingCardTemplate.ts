/**
 * A greeting card template from the "Tarjeta" SharePoint list.
 *
 * Field mapping:
 *   shortName ← NombreBreve
 *   subject   ← Asunto
 *   body      ← Cuerpo  (HTML allowed)
 *   icon      ← Icono   (emoji or image URL — SUPUESTO: se asume emoji/texto)
 *   order     ← Orden
 *   isActive  ← EstadoMaestra
 *
 * Template variables supported in subject/body:
 *   {nombre}  → recipient name
 *   {mensaje} → personal message typed by sender
 */
export interface IGreetingCardTemplate {
  id: number;
  shortName: string;
  subject: string;
  body: string;
  icon: string;
  order: number;
  isActive: boolean;
}
