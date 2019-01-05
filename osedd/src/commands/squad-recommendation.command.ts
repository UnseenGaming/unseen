import * as Discord from 'discord.js';
import { table } from 'table';

import { DiscordService } from '../services/discord.service';
import { SwgohHelpService } from '../services/swgoh-help.service';

import { BaseCommand } from './base.command';
import { HelpMessageFields } from './base.command';
import { SwgohHelpSquadToon } from '../collections/Squad.collection';
import { SwgohHelpPlayer, SwgohHelpPlayerToon } from '../collections/Player.collection';

export class SquadRecommendationCommand extends BaseCommand {
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
        
        if(parameters !== null && parameters.length > 0){
            const user = parameters[0];
            const group = parameters[1];
            
            this.logger.info(`Recieved squad recommendation command for user ${user} for category ${group}`);

            const players = await this.swgohHelpService.fetchPlayers({
                allycodes: [user]
            })
            const player = players[0];

            const squads = await this.swgohHelpService.fetchSquads(group);
            const characterDefs = await this.swgohHelpService.fetchUnitList();

            for(let i=0; i<squads.length; i++){
                const response = {embed: {
                    color: 0x1ffc60,
                    author: {
                        name: squads[i].name
                    },
                    description: `${squads[i].phase}\n`,
                    fields: [],
                    timestamp: new Date(),
                  }
                };

                let allRequirementsMet = true;
                let unlockedToons = true;

                response.embed.description += `:star::gear::level_slider:\n`;

                squads[i].team.forEach((squadMember) => {
                    let playerToon = player.roster.find((toon) => toon.defId === squadMember.name);

                    if(playerToon === undefined){
                        playerToon = {
                            rarity: 0,
                            gear: 0,
                            level: 0,
                            skills: []
                        } as SwgohHelpPlayerToon

                        unlockedToons = false;
                        response.embed.color = 0xfc1f4c;
                    }

                    const characterDef = characterDefs.find((char) => char.baseId === squadMember.name);
                    
                    const checkRequirements = [
                        this.checkRequirement(squadMember.rarity, playerToon.rarity),
                        this.checkRequirement(squadMember.gear, playerToon.gear),
                        this.checkRequirement(squadMember.level, playerToon.level)
                    ]

                    allRequirementsMet = allRequirementsMet && checkRequirements.every((requirement) => requirement === ':white_check_mark:');

                    response.embed.description += `${checkRequirements.join('')} ${characterDef.nameKey}\n`;

                    if(!allRequirementsMet && unlockedToons){
                        response.embed.color = 0xfc601f;
                    }
                });

                await this.discordService.reply(message, response);
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
            return ':white_check_mark:';
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