import { IGreetingCardTemplate } from '../models/GreetingCardTemplate';
import { ISharePointRepository } from '../repositories/SharePointRepository';

interface ITarjetaItem {
  Id: number;
  NombreBreve: string;
  Asunto: string;
  Cuerpo: string;
  Icono: string;
  Orden?: number;
  EstadoMaestra: string | boolean;
}

export interface ICardTemplateService {
  getActiveTemplates(): Promise<IGreetingCardTemplate[]>;
}

export class CardTemplateService implements ICardTemplateService {
  constructor(
    private readonly repository: ISharePointRepository,
    private readonly listName: string
  ) {}

  async getActiveTemplates(): Promise<IGreetingCardTemplate[]> {
    const items = await this.repository.getListItems<ITarjetaItem>(
      this.listName,
      ['Id', 'NombreBreve', 'Asunto', 'Cuerpo', 'Icono', 'Orden', 'EstadoMaestra'],
      undefined,
      'Orden asc'
    );

    return items
      .filter(item =>
        item.EstadoMaestra === 'Activo' ||
        item.EstadoMaestra === true ||
        item.EstadoMaestra === 'true'
      )
      .map(item => ({
        id: item.Id,
        shortName: item.NombreBreve || '',
        subject: item.Asunto || '',
        body: item.Cuerpo || '',
        icon: item.Icono || '🎂',
        order: item.Orden || 0,
        isActive: true
      }));
  }
}

export class MockCardTemplateService implements ICardTemplateService {
  async getActiveTemplates(): Promise<IGreetingCardTemplate[]> {
    return [
      {
        id: 1,
        shortName: 'Tarjeta Festiva',
        subject: '🎂 ¡Feliz Cumpleaños, {nombre}!',
        body: '<p style="font-family:Segoe UI,sans-serif">¡Hola <strong>{nombre}</strong>!</p><p>En este día tan especial, todo el equipo te desea un maravilloso cumpleaños. {mensaje}</p><p>¡Que cumplas muchos más!</p>',
        icon: '🎂',
        order: 1,
        isActive: true
      },
      {
        id: 2,
        shortName: 'Tarjeta Elegante',
        subject: '🎉 Felicitaciones en tu día, {nombre}',
        body: '<p style="font-family:Segoe UI,sans-serif">Estimado/a <strong>{nombre}</strong>,</p><p>Con motivo de tu cumpleaños, te enviamos nuestras más sinceras felicitaciones.</p><p>{mensaje}</p><p>Un abrazo del equipo.</p>',
        icon: '🎉',
        order: 2,
        isActive: true
      },
      {
        id: 3,
        shortName: 'Tarjeta Divertida',
        subject: '🥳 ¡Es tu día, {nombre}!',
        body: '<p style="font-family:Segoe UI,sans-serif">¡<strong>{nombre}</strong>, es tu cumpleaños y lo vamos a celebrar! 🎊</p><p>{mensaje}</p><p>¡Con mucho cariño, tu equipo! 🎈</p>',
        icon: '🥳',
        order: 3,
        isActive: true
      }
    ];
  }
}
