import { IBirthdayPerson } from '../models/BirthdayPerson';
import { ISharePointRepository } from '../repositories/SharePointRepository';
import { parseSPDate } from '../utils/dateUtils';
import { getUpcomingBirthdays } from '../utils/birthdayRules';

interface IColaboradorItem {
  Id: number;
  NombreTrabajador: string;
  Cargo: string;
  Correo: string;
  IdArea?: string;
  Fecha: string;      // ISO date — birthday month/day extracted from here
  Dia?: number;       // Optional: if stored separately as a number
  EstadoMaestra: string | boolean;
}

export interface IBirthdayService {
  getUpcomingBirthdays(limit?: number): Promise<IBirthdayPerson[]>;
}

export class BirthdayService implements IBirthdayService {
  constructor(
    private readonly repository: ISharePointRepository,
    private readonly listName: string
  ) {}

  async getUpcomingBirthdays(limit = 10): Promise<IBirthdayPerson[]> {
    // SUPUESTO: filtering by EstadoMaestra text 'Activo'. Adjust if it's a boolean column.
    // Eliminados los parámetros 'select' y 'orderby' porque generan HTTP 400 si
    // los nombres internos de las columnas en SharePoint difieren de lo esperado.
    // Cast to any since SharePoint doesn't strictly match the previous interface 
    // due to internal name differences.
    const items = await this.repository.getListItems<any>(
      this.listName
    );

    const people: IBirthdayPerson[] = items
      .map((item: any) => {
        const estado = item.Estado || item.EstadoMaestra || String(item.OData__Status || '');
        const isActive =
          estado === 'On' ||
          estado === 'Activo' ||
          estado === true ||
          estado === 'true';

        // Priorizamos los nombres internos que SharePoint acostumbra a usar cuando
        // creas una columna llamada "Nombres y Apellidos". 
        let nombre = item.Nombres_x0020_y_x0020_Apellidos || 
                     item.Nombres_x0020_y_x0020_Apelli || 
                     item.NombresyApellidos || 
                     item.NombresYApellidos || 
                     item.NombreTrabajador || 
                     item.Title || '';
                     
        if (nombre === 'Ver Detalle' || nombre === 'Ver detalle') {
            nombre = 'Sin Nombre (Revisar Nombre Interno)';
        }

        let day = parseInt(item.Dia, 10);
        let month = parseInt(item.Mes, 10);

        // Si la columna Mes no viene como número, intentemos el parseo viejo
        if (isNaN(day) || isNaN(month)) {
          const parsed = parseSPDate(item.Fecha);
          if (parsed) {
            day = parsed.day;
            month = parsed.month;
          } else if (item.Fecha && typeof item.Fecha === 'string') {
            // Intento manual de parsear dd/mm/yyyy si parseSPDate falla (porque parseSPDate busca formato ISO)
            const parts = item.Fecha.split('/');
            if (parts.length >= 2) {
              day = parseInt(parts[0], 10);
              month = parseInt(parts[1], 10);
            }
          }
        }

        if (!day || !month || isNaN(day) || isNaN(month)) return null;

        return {
          id: item.Id,
          name: nombre,
          jobTitle: item.Cargo || '',
          email: item.Correo || '',
          areaId: item.Area || item.IdArea,
          birthdayDate: new Date(2000, month - 1, day), // El año no importa, se usa Date para lógica interna de JS
          birthdayDay: day,
          birthdayMonth: month,
          isActive
        } as IBirthdayPerson;
      })
      .filter((p): p is IBirthdayPerson => p !== null);

    return getUpcomingBirthdays(people, limit);
  }
}

/**
 * Mock implementation — returns realistic fake data.
 * Person at index 0 always has today's birthday so the Greet button is enabled.
 */
export class MockBirthdayService implements IBirthdayService {
  async getUpcomingBirthdays(limit = 10): Promise<IBirthdayPerson[]> {
    const today = new Date();

    const offsets = [0, 2, 5, 7, 10, 14, 18, 22];
    const names = [
      { name: 'María González', jobTitle: 'Gerente de Recursos Humanos', email: 'maria.gonzalez@empresa.com' },
      { name: 'Carlos Ramírez', jobTitle: 'Desarrollador Senior', email: 'carlos.ramirez@empresa.com' },
      { name: 'Ana Martínez',   jobTitle: 'Diseñadora UX',             email: 'ana.martinez@empresa.com' },
      { name: 'Luis Pérez',     jobTitle: 'Analista de Datos',         email: 'luis.perez@empresa.com' },
      { name: 'Sofía Torres',   jobTitle: 'Coordinadora de Proyectos', email: 'sofia.torres@empresa.com' },
      { name: 'Diego Flores',   jobTitle: 'Arquitecto de Soluciones',  email: 'diego.flores@empresa.com' },
      { name: 'Valentina Ruiz', jobTitle: 'QA Engineer',               email: 'valentina.ruiz@empresa.com' },
      { name: 'Andrés Castro',  jobTitle: 'Product Owner',             email: 'andres.castro@empresa.com' }
    ];

    return offsets.slice(0, limit).map((offset, i) => {
      const bDate = new Date(today.getTime()); // getTime() avoids TS overload ambiguity with Date arg
      bDate.setDate(today.getDate() + offset);
      return {
        id: i + 1,
        name: names[i].name,
        jobTitle: names[i].jobTitle,
        email: names[i].email,
        birthdayDate: bDate,
        birthdayDay: bDate.getDate(),
        birthdayMonth: bDate.getMonth() + 1,
        isActive: true
      };
    });
  }
}
