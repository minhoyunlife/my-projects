import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { AppEnvironmentVariables } from '@/src/modules/config/environments/app.environment';
import { DatabaseEnvironmentVariables } from '@/src/modules/config/environments/database.environment';
import { S3EnvironmentVariables } from '@/src/modules/config/environments/s3.environment';

const environmentVariables: ClassConstructor<any>[] = [
  // 향후 환경변수가 늘어날 때, 여기에 추가해나갈 것
  AppEnvironmentVariables,
  DatabaseEnvironmentVariables,
  S3EnvironmentVariables,
];

export function validate(config: Record<string, unknown>) {
  const totalErrors = environmentVariables.flatMap((envClass) => {
    const validatedConfig = plainToInstance(envClass, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    return errors.map((err) => ({
      property: err.property,
      value: err.value,
      constraints: err.constraints,
      message: `
        Environment Variables ${err.property} is wrong. 
        input: ${err.value}, 
        constraints: ${Object.values(err.constraints || {}).join(', ')}
      `,
    }));
  });

  if (totalErrors.length > 0) {
    throw new Error(totalErrors.map((err) => err.message).join('\n'));
  }
  return config;
}
