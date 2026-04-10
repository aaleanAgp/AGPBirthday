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
    const items = await this.repository.getListItems<IColaboradorItem>(
      this.listName,
      ['Id', 'NombreTrabajador', 'Cargo', 'Correo', 'IdArea', 'Fecha', 'Dia', 'EstadoMaestra'],
      undefined,  // No server-side filter — client filters by isActive after mapping
      'NombreTrabajador asc'
    );

    const people: IBirthdayPerson[] = items
      .map(item => {
        const parsed = parseSPDate(item.Fecha);
        if (!parsed) return null;

        const isActive =
          item.EstadoMaestra === 'Activo' ||
          item.EstadoMaestra === true ||
          item.EstadoMaestra === 'true';

        return {
          id: item.Id,
          name: item.NombreTrabajador || '',
          jobTitle: item.Cargo || '',
          email: item.Correo || '',
          areaId: item.IdArea,
          birthdayDate: new Date(item.Fecha),
          birthdayDay: item.Dia || parsed.day,
          birthdayMonth: parsed.month,
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
