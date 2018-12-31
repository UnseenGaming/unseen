import * as fse from 'fs-extra';
import * as mongoose from 'mongoose';
import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';


import { LoggerService } from './services/logger.service';
import { DiscordService } from './services/discord.service';
import { Configuration } from './interfaces/configuration.interface';
import { SwgohHelpService } from './services/swgoh-help.service';

const logger = new LoggerService();

async function main() {
    logger.info('Reading configuration');

    const configuration = await readConfiguration();

    const discord = new DiscordService(
        configuration.discord.prefix,
        configuration.discord.token
    );

    const swgohHelp = new SwgohHelpService(
        configuration.swgohHelp.username,
        configuration.swgohHelp.password
    )

    mongoose.connect('mongodb://localhost:27017/test');
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