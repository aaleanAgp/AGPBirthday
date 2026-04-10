/**
 * Represents a person from the "Colaborador" SharePoint list
 * who has a birthday in the upcoming period.
 *
 * Field mapping:
 *   name       ← NombreTrabajador
 *   jobTitle   ← Cargo
 *   email      ← Correo
 *   areaId     ← IdArea
 *   birthdayDay ← Dia (if stored separately) OR extracted from Fecha
 *   isActive   ← EstadoMaestra == 'Activo' | true
 */
export interface IBirthdayPerson {
  id: number;
  name: string;
  jobTitle: string;
  email: string;
  areaId?: string;
  birthdayDate: Date;
  birthdayDay: number;
  birthdayMonth: number;
  isActive: boolean;
}
