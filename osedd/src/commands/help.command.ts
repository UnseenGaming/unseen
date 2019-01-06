import * as Discord from 'discord.js';

import { BaseCommand } from './base.command';

export class HelpCommand extends BaseCommand {
    constructor(
        private commands: { [command: string] : BaseCommand; },
        private prefix: string
    ){
        super();
    }

    async handleCommand(message: Discord.Message, parameters: string[]): Promise<void>{
        this.logger.info(`Recieved help command`);

        const response = {embed: {
            color: 3447003,
            title: "Help",
            description: "Available commands:",
            fields: [] as any[],
            timestamp: new Date(),
          }
        };

        Object.keys(this.commands).forEach((command) => {
            response.embed.fields.push({
                name: `${this.prefix}${command}`,
                value: this.commands[command].description()
            });
        });
        
        await this.discordService.reply(message, response);
    }

    description(): string{
        return "Get help for all commands";
    }
}