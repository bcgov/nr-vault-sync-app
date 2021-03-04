import winston, {format} from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: format.cli(),
  transports: [
    new winston.transports.Console(),
  ],
});
