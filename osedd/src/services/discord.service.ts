import * as Discord from 'discord.js';

import { LoggerService } from './logger.service';
import { BaseCommand } from '../commands/base.command';
import { HelpCommand } from '../commands/help.command';

import { commandRegister } from '../commands/register';

export class DiscordService {
    private static _instance: DiscordService;
    private logger!: LoggerService;
    private commands!: { [command: string] : BaseCommand; };

    constructor(
        private prefix: string,
        private token: string
    ) {
        if (DiscordService._instance) {
            return DiscordService._instance;
        }

        DiscordService._instance = this;

        this.commands = {};
        this.logger = new LoggerService();
        this.logger.verbose(`Creating a new instance of DiscordService`);

        this.initialize();
    }

    static get instance(): DiscordService {
        return this._instance;
    }

    private async initialize() {
        const client = new Discord.Client();

        client.on('error', (error) => {
            this.logger.error(`Error in Discord connection: ${error.message}`);
        });
 
        client.on('ready', () => {
          this.logger.info(`Logged in as ${client.user.tag}!`);
        });
         
        client.on('message', (message) => { this.handleMessage(message);});
                
        try {
            await client.login(this.token);
        }catch(loginError){
            this.logger.error(`Error while logging in to Discord: ${loginError.message}`);
        }

        this.registerCommand('help', new HelpCommand(this.commands, this.prefix));
        commandRegister(this, this.prefix);
    }

    registerCommand(command: string, commandHandler: BaseCommand){
        this.logger.info(`Registering command ${command}`);
        this.commands[command] = commandHandler;
    }

    private async handleMessage(message: Discord.Message){
        if(message.content.startsWith(this.prefix)){
            this.logger.info(`Recieved a command: ${message.content}`);
            await message.react('🥁');
            
            const fullCommand = message.content.slice(1);
            const commandParts = fullCommand.split(' ');
            const command = commandParts.shift();

            if(command !== undefined){
                this.handleCommand(message, command.toLowerCase(), commandParts);
            }
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

    async removeReaction(message: Discord.Message, emojiName?:string){
        const removeReactions = message.reactions.filter((reaction) => {
            if(reaction.me === true){
                if(emojiName !== undefined){
                    return reaction.emoji.name === emojiName;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        }).array();

        for(let i=0; i<removeReactions.length; i++){
            const react = removeReactions[i];
            await react.remove();
        }
    }

    private validCommand(command: string): boolean {
        return Object.keys(this.commands).includes(command);
    }

    async reply(message: Discord.Message, content: any){
        message.channel.send(content);
    }
}
