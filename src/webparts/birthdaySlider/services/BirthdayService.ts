/* eslint-disable @typescript-eslint/no-explicit-any */
import { IBirthdayPerson } from '../models/BirthdayPerson';
import { ISharePointRepository } from '../repositories/SharePointRepository';
import { parseSPDate } from '../utils/dateUtils';
import { getUpcomingBirthdays } from '../utils/birthdayRules';
import { getAllBirthdaysSorted } from '../utils/birthdayAllFilters';

export interface IBirthdayService {
  getUpcomingBirthdays(limit?: number): Promise<IBirthdayPerson[]>;
  getAllBirthdays(): Promise<IBirthdayPerson[]>;
}

export class BirthdayService implements IBirthdayService {
  constructor(
    private readonly repository: ISharePointRepository,
    private readonly listName: string
  ) {}

  async getUpcomingBirthdays(limit = 10): Promise<IBirthdayPerson[]> {
    const people = await this._loadPeople();
    return getUpcomingBirthdays(people, limit);
  }

  async getAllBirthdays(): Promise<IBirthdayPerson[]> {
    const people = await this._loadPeople();
    return getAllBirthdaysSorted(people);
  }

  private async _loadPeople(): Promise<IBirthdayPerson[]> {
    const items = await this.repository.getListItems<any>(this.listName);

    return items
      .map((item: any) => this._mapPerson(item))
      .filter((person): person is IBirthdayPerson => person !== null);
  }

  private _mapPerson(item: any): IBirthdayPerson | null {
    const estado = item.Estado || item.EstadoMaestra || String(item.OData__Status || '');
    const isActive =
      estado === 'On' ||
      estado === 'Activo' ||
      estado === true ||
      estado === 'true';

    let nombre = item.Nombres_x0020_y_x0020_Apellidos ||
      item.Nombres_x0020_y_x0020_Apelli ||
      item.NombresyApellidos ||
      item.NombresYApellidos ||
      item.NombreTrabajador ||
      item.Title || '';

    if (nombre === 'Ver Detalle' || nombre === 'Ver detalle') {
      nombre = 'Sin Nombre';
    }

    let day = parseInt(item.Dia, 10);
    let month = parseInt(item.Mes, 10);

    if (isNaN(day) || isNaN(month)) {
      const parsed = parseSPDate(item.Fecha);
      if (parsed) {
        day = parsed.day;
        month = parsed.month;
      } else if (item.Fecha && typeof item.Fecha === 'string') {
        const parts = item.Fecha.split('/');
        if (parts.length >= 2) {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        }
      }
    }

    if (!day || !month || isNaN(day) || isNaN(month)) {
      return null;
    }

    const areaField = item.Area || item.IdArea || null;
    const areaId = this._normalizeLookupValue(areaField);
    const areaName = this._normalizeLookupLabel(
      item.Area_x003a_Title ||
      item.IdArea_x003a_Title ||
      (item.Area && item.Area.Title) ||
      (item.IdArea && item.IdArea.Title) ||
      (item.Area && item.Area.lookupValue) ||
      (item.IdArea && item.IdArea.lookupValue) ||
      areaField
    );

    return {
      id: item.Id,
      name: nombre,
      jobTitle: item.Cargo || '',
      email: item.Correo || '',
      areaId,
      areaName,
      birthdayDate: new Date(2000, month - 1, day),
      birthdayDay: day,
      birthdayMonth: month,
      isActive
    };
  }

  private _normalizeLookupValue(value: any): string | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'object') {
      return String(value.Id || value.ID || value.id || value.lookupId || value.lookupValue || value.Title || '');
    }

    return String(value);
  }

  private _normalizeLookupLabel(value: any): string | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'object') {
      return String(value.Title || value.lookupValue || value.value || value.Id || value.id || '');
    }

    return String(value);
  }
}

export class MockBirthdayService implements IBirthdayService {
  async getUpcomingBirthdays(limit = 10): Promise<IBirthdayPerson[]> {
    const allPeople = this._buildMockPeople();
    return getUpcomingBirthdays(allPeople, limit);
  }

  async getAllBirthdays(): Promise<IBirthdayPerson[]> {
    return getAllBirthdaysSorted(this._buildMockPeople());
  }

  private _buildMockPeople(): IBirthdayPerson[] {
    const today = new Date();
    const offsets = [0, 2, 5, 7, 10, 14, 18, 22, 28, 35, 44, 58];
    const names = [
      { name: 'Maria Gonzalez', jobTitle: 'Gerente de Recursos Humanos', email: 'maria.gonzalez@empresa.com', areaName: 'Talento Humano' },
      { name: 'Carlos Ramirez', jobTitle: 'Desarrollador Senior', email: 'carlos.ramirez@empresa.com', areaName: 'Tecnologia' },
      { name: 'Ana Martinez', jobTitle: 'Disenadora UX', email: 'ana.martinez@empresa.com', areaName: 'Diseno' },
      { name: 'Luis Perez', jobTitle: 'Analista de Datos', email: 'luis.perez@empresa.com', areaName: 'Analitica' },
      { name: 'Sofia Torres', jobTitle: 'Coordinadora de Proyectos', email: 'sofia.torres@empresa.com', areaName: 'PMO' },
      { name: 'Diego Flores', jobTitle: 'Arquitecto de Soluciones', email: 'diego.flores@empresa.com', areaName: 'Arquitectura' },
      { name: 'Valentina Ruiz', jobTitle: 'QA Engineer', email: 'valentina.ruiz@empresa.com', areaName: 'Calidad' },
      { name: 'Andres Castro', jobTitle: 'Product Owner', email: 'andres.castro@empresa.com', areaName: 'Producto' },
      { name: 'Juliana Mejia', jobTitle: 'Lider Comercial', email: 'juliana.mejia@empresa.com', areaName: 'Comercial' },
      { name: 'Camilo Rojas', jobTitle: 'Consultor BI', email: 'camilo.rojas@empresa.com', areaName: 'BI' },
      { name: 'Paula Leon', jobTitle: 'Especialista SEO', email: 'paula.leon@empresa.com', areaName: 'Marketing' },
      { name: 'Ricardo Vega', jobTitle: 'Administrador de Sistemas', email: 'ricardo.vega@empresa.com', areaName: 'Infraestructura' }
    ];

    return offsets.map((offset, index) => {
      const birthdayDate = new Date(today.getTime());
      birthdayDate.setDate(today.getDate() + offset);

      return {
        id: index + 1,
        name: names[index].name,
        jobTitle: names[index].jobTitle,
        email: names[index].email,
        areaId: String(index + 1),
        areaName: names[index].areaName,
        birthdayDate,
        birthdayDay: birthdayDate.getDate(),
        birthdayMonth: birthdayDate.getMonth() + 1,
        isActive: true
      };
    });
  }
}
