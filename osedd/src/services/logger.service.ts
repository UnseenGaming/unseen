import * as Winston from 'winston';

export class LoggerService {
    private static instance: LoggerService;
    private logger!: Winston.Logger;

    constructor() {        
        if (LoggerService.instance) {
            return LoggerService.instance;
        }

        LoggerService.instance = this;

        this.logger = Winston.createLogger({
            format: Winston.format.combine(
                Winston.format.colorize(),
                Winston.format.timestamp(),
                Winston.format.align(),
                Winston.format.printf((info) => {
                    const {
                        timestamp, level, message, ...args
                    } = info;

                    const utcTimestamp = timestamp.slice(0, 19).replace('T', ' ');
                    return `${utcTimestamp} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
                })),
            transports: [
                new Winston.transports.Console()
            ]
        });
    }

    log(level: string, message: string, callback?: Winston.LogCallback): Winston.Logger {
        return this.logger.log(level, message, callback);
    }

    error(message: string, callback?: Winston.LogCallback) {
        return this.logger.error(message, callback);
    }

    warn(message: string, callback?: Winston.LogCallback) {
        return this.logger.warn(message, callback);
    }

    info(message: string, callback?: Winston.LogCallback) {
        return this.logger.info(message, callback);
    }

    verbose(message: string, callback?: Winston.LogCallback) {
        return this.logger.verbose(message, callback);
    }

    debug(message: string, callback?: Winston.LogCallback) {
        return this.logger.debug(message, callback);
    }

    silly(message: string, callback?: Winston.LogCallback) {
        return this.logger.silly(message, callback);
    }
}
