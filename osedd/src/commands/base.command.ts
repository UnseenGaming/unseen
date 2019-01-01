import * as Discord from 'discord.js';
import { LoggerService } from '../services/logger.service';

export interface HelpMessageFields {
    name: string,
    value: string
}

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

    async help(message: Discord.Message): Promise<void> {
        const response = {embed: {
            color: 3447003,
            title: "Help",
            description: this.helpDescription(),
            fields: this.helpFields(),
            timestamp: new Date(),
          }
        };

        await message.reply(response);

    }

    helpDescription(): string {
        return this.description();
    }

    helpFields(): HelpMessageFields[] {
        return null;
    }
}