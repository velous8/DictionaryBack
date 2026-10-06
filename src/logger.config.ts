import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? 'info',

    transport:
      process.env.NODE_ENV === 'production'
        ? {
            targets: [
              {
                target: 'pino/file',
                options: {
                  destination: '/app/logs/requests.log',
                  mkdir: true,
                },
                level: 'info',
              },
            ],
          }
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
            },
          },
  },
};