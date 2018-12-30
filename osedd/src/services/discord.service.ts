import * as Discord from 'discord.js';

import { LoggerService } from './logger.service';
import { BaseCommand } from '../commands/base.command';
import { HelpCommand } from '../commands/help.command';

export class DiscordService {
    private static instance: DiscordService;
    private logger: LoggerService;
    private commands: { [command: string] : BaseCommand; } 

    constructor(
        private prefix: string,
        private token: string
    ) {
        if (DiscordService.instance) {
            return DiscordService.instance;
        }

        DiscordService.instance = this;

        this.logger = new LoggerService();
        this.logger.verbose(`Creating a new instance of DiscordService`);

        this.commands = {};

        this.initialize();
    }

    private async initialize() {
        const client = new Discord.Client();

        client.on('error', (error) => {
            this.logger.error(`Error in Discord connection: ${error.message}`);
        })
 
        client.on('ready', () => {
          this.logger.info(`Logged in as ${client.user.tag}!`);
        });
         
        client.on('message', (message) => { this.handleMessage(message) });
                
        try {
            await client.login(this.token);
        }catch(loginError){
            this.logger.error(`Error while logging in to Discord: ${loginError.message}`);
        }

        this.registerCommand('help', new HelpCommand(this.commands, this.prefix));
    }

    public registerCommand(command: string, commandHandler: BaseCommand){
        this.commands[command] = commandHandler;
    }

    private async handleMessage(message: Discord.Message){
        if(message.content.startsWith(this.prefix)){
            this.logger.info(`Recieved a command: ${message.content}`);
            await message.react('🥁');
            
            const fullCommand = message.content.slice(1);
            const commandParts = fullCommand.split(' ');
            const command = commandParts.shift().toLowerCase();
            
            this.handleCommand(message, command, commandParts);
        }
    }

    private async handleCommand(message: Discord.Message, command: string, parameters: string[]){
        if(this.validCommand(command)){
            await message.react('👍');
            await this.removeReaction(message, '🥁');
            await this.commands[command].handleCommand(message, parameters);
        } else {
            await message.react('🤷');
            await this.removeReaction(message, '🥁');
        }
    }

    private async removeReaction(message: Discord.Message, emojiName?:string){
        const removeReactions = message.reactions.filter((reaction) => {
            if(reaction.me == true){
                if(emojiName !== undefined){
                    return reaction.emoji.name == emojiName;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }).array();

        for(var i=0; i<removeReactions.length; i++){
            const react = removeReactions[i];
            await react.remove()
        }
    }

    private validCommand(command: string): boolean {
        return Object.keys(this.commands).includes(command);
    }

    member: number;
}
