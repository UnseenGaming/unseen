import * as Discord from 'discord.js';
import { table } from 'table';

import { DiscordService } from '../services/discord.service';
import { SwgohHelpService } from '../services/swgoh-help.service';

import { BaseCommand } from './base.command';
import { HelpMessageFields } from './base.command';
import { SwgohHelpSquadToon } from '../collections/Squad.collection';
import { SwgohHelpPlayer } from '../collections/Player.collection';

export class SquadRecommendationCommand extends BaseCommand {
    private discordService: DiscordService;
    private swgohHelpService: SwgohHelpService;
    private groups: string[];

    constructor(
        private prefix: string
    ){
        super();
        this.discordService = DiscordService.instance;
        this.swgohHelpService = new SwgohHelpService();

        this.init();
    }

    private async init(){
        const squads = await this.swgohHelpService.fetchSquads();
        
        this.groups = squads.map((squad) => squad.group);
        this.groups = [...new Set(this.groups)];
    }

    async handleCommand(message: Discord.Message, parameters: string[]): Promise<void>{
        
        if(parameters !== null && parameters.length > 1){
            const user = parameters[0];
            const group = parameters[1];
            
            this.logger.info(`Recieved squad recommendation command for user ${user} for category ${group}`);

            const players = await this.swgohHelpService.fetchPlayers({
                allycodes: [user]
            })
            const player = players[0];

            const squads = await this.swgohHelpService.fetchSquads(group);

            const response = {embed: {
                color: 3447003,
                title: "Squad recommendations",
                description: `Recommended squads for ${group}:`,
                fields: [],
                timestamp: new Date(),
              }
            };

            for(let i=0; i<squads.length; i++){
                const response = {embed: {
                    color: 3447003,
                    title: squads[i].name,
                    description: squads[i].phase,
                    fields: [],
                    timestamp: new Date(),
                  }
                };

                squads[i].team.forEach((squadMember) => {
                    const playerToon = player.roster.find((toon) => toon.defId === squadMember.name);
                    
                    response.embed.fields.push({
                        name: squadMember.name,
                        value: `
${this.checkRequirement(squadMember.rarity, playerToon.rarity)} Rarity: ${squadMember.rarity}
${this.checkRequirement(squadMember.gear, playerToon.gear)} Gear level: ${squadMember.gear} 
${this.checkRequirement(squadMember.level, playerToon.level)} Level: ${squadMember.level} 
Skills: ${squadMember.skills.join(', ')}`
                    })
                });

                await message.reply(response);
            }
        } else {
            await this.discordService.removeReaction(message);
            await message.react('🤷');
            await this.help(message);
        }
    }

    checkRequirement(goal, current){
        if(goal>current){
            return ':no_entry_sign:';
        } else {
            return ':checkered_flag:';
        }
    }

    helpFields(): HelpMessageFields[] {
        return [{
            name: 'Required parameters:',
            value: `**Player ID** The ally code of the user to check\n**Category** any of *${this.groups.join(', ')}*`
        }];
    }

    description(): string{
        return "Get squad recommendations";
    }
}