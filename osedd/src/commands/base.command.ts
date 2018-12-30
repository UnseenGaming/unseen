import * as Discord from 'discord.js';
import { LoggerService } from '../services/logger.service';

export class BaseCommand {
    protected logger: LoggerService;

    constructor(){
        this.logger = new LoggerService();
    }

    async handleCommand(message: Discord.Message, parameters: string[]): Promise<void>{
        this.logger.error(`Recieved a request to handle a command in base command class`);
    }

    description(): string{
        return "";
    }
}