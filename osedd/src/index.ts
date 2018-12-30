import * as fse from 'fs-extra';

import { LoggerService } from './services/logger.service';
import { DiscordService } from './services/discord.service';
import { Configuration } from './interfaces/configuration.interface';

const logger = new LoggerService();

async function main() {
    logger.info('Reading configuration');

    const configuration = await readConfiguration();

    const discord = new DiscordService(
        configuration.prefix,
        configuration.token
    );   
}

async function readConfiguration(): Promise<Configuration>{
    if(await fse.pathExists('configuration.json')){
        return await fse.readJSON('configuration.json');
    } else {
        logger.error(`No configuration file found.`);
        process.exit();
    }
}

main();