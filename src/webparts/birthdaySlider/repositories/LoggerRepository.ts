import { ISharePointRepository } from './SharePointRepository';

export interface ILogEntry {
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: string;
  timestamp?: Date;
}

export interface ILoggerRepository {
  log(entry: ILogEntry): Promise<void>;
}

export class LoggerRepository implements ILoggerRepository {
  constructor(
    private readonly spRepository: ISharePointRepository,
    private readonly logListName: string
  ) {}

  async log(entry: ILogEntry): Promise<void> {
    try {
      const ts = (entry.timestamp || new Date()).toISOString();
      await this.spRepository.addListItem(this.logListName, {
        Title: `[${entry.level}] ${ts}`,
        Nivel: entry.level,
        Mensaje: entry.message,
        Contexto: entry.context || '',
        Fecha: ts
      });
    } catch (err) {
      console.warn('[LoggerRepository] Failed to write log entry:', err);
    }
  }
}

export class MockLoggerRepository implements ILoggerRepository {
  async log(entry: ILogEntry): Promise<void> {
    const fn = entry.level === 'ERROR' ? console.error : entry.level === 'WARN' ? console.warn : console.log;
    fn(`[BirthdayWidget][${entry.level}]`, entry.message, entry.context ? `(${entry.context})` : '');
  }
}
