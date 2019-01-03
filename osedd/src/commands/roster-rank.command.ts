import * as Discord from 'discord.js';
import { table } from 'table';

import { SwgohHelpService } from '../services/swgoh-help.service';

import { BaseCommand } from './base.command';
import { HelpMessageFields } from './base.command';
import { SwgohHelpSquadToon } from '../collections/Squad.collection';
import { SwgohHelpPlayer, SwgohHelpPlayerToon } from '../collections/Player.collection';

export class RosterRankCommand extends BaseCommand {
    private swgohHelpService: SwgohHelpService;
    private groups: string[];

    private topNumberOfToons = 20;

    constructor(
        private prefix: string
    ){
        super();
        this.swgohHelpService = new SwgohHelpService();

        this.init();
    }

    private async init(){
        const squads = await this.swgohHelpService.fetchSquads();
        
        this.groups = squads.map((squad) => squad.group);
        this.groups = [...new Set(this.groups)];
    }

    async handleCommand(message: Discord.Message, parameters: string[]): Promise<void>{
        
        if(parameters !== null && parameters.length > 0){
            const user = parameters[0];
            
            this.logger.info(`Recieved roster rank command for user ${user}`);

            const players = await this.swgohHelpService.fetchPlayers({
                allycodes: [user]
            })
            const player = players[0];

            let response = `Top ${this.topNumberOfToons} toons for ${user}\n`;

            const scores = [...player.roster]
                .filter((toon) => toon.combatType === 1)
                .sort((a: SwgohHelpPlayerToon, b: SwgohHelpPlayerToon) => {
                    return b.gp - a.gp;
                }).slice(0,this.topNumberOfToons);

            scores.forEach((toon) => {
                response += `${toon.defId} ${toon.gp}\n`;
            })

            await this.discordService.reply(message, response);
        } else {
            await this.discordService.removeReaction(message);
            await message.react('🤷');
            await this.help(message);
        }
    }

    helpFields(): HelpMessageFields[] {
        return [{
            name: 'Required parameters:',
            value: `**Player ID** The ally code of the user to check`
        }];
    }

    description(): string{
        return "Score roster";
    }
}