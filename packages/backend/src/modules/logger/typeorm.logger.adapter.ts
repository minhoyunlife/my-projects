import { Logger } from 'winston';

export class TypeOrmLoggerAdapter {
  constructor(private readonly logger: Logger) {}

  logQuery(query: string, parameters?: any[]) {
    this.logger.info('Database query', {
      context: 'Database',
      metadata: {
        query: this.formatQuery(query),
        parameters,
      },
    });
  }

  logQueryError(error: string | Error, query: string, parameters?: any[]) {
    this.logger.error('Database query error', {
      context: 'Database',
      metadata: {
        query: this.formatQuery(query),
        parameters,
        error: error instanceof Error ? error.message : error,
      },
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    this.logger.warn('Slow query detected', {
      context: 'Database',
      metadata: {
        query: this.formatQuery(query),
        parameters,
        executionTime: `${time}ms`,
      },
    });
  }

  logSchemaBuild(message: string) {
    this.logger.info(message, {
      context: 'Database',
      metadata: { type: 'schema' },
    });
  }

  logMigration(message: string) {
    this.logger.info(message, {
      context: 'Database',
      metadata: { type: 'migration' },
    });
  }

  log(level: 'log' | 'info' | 'warn', message: string) {
    const method = level === 'warn' ? 'warn' : 'info';
    this.logger[method](message, {
      context: 'Database',
    });
  }

  private formatQuery(query: string): string {
    return query.replace(/"/g, "'");
  }
}
