import * as Discord from 'discord.js';
import { table } from 'table';

import { DiscordService } from '../services/discord.service';
import { SwgohHelpService } from '../services/swgoh-help.service';

import { BaseCommand } from './base.command';
import { HelpMessageFields } from './base.command';
import { SwgohHelpSquadToon } from '../collections/Squad.collection';
import { SwgohHelpPlayer, SwgohHelpPlayerToon, SwgohHelpToonSkill } from '../collections/Player.collection';
import { SwgohHelpSkills } from '../collections/Skills.collection';

interface SquadRequirements {
    requirements: {
        rarity: boolean;
        gear: boolean;
        level: boolean;
        skills: boolean;
    };
    required: boolean;
    leader: boolean;
    ready: boolean;
    name: string;
}

export class SquadRecommendationCommand extends BaseCommand {
    private swgohHelpService: SwgohHelpService;
    private groups: string[];

    constructor(
        private prefix: string
    ){
        super();
        this.discordService = DiscordService.instance;
        this.swgohHelpService = new SwgohHelpService();
        this.groups = [];

        this.init();
    }

    private async init(){
        const squads = await this.swgohHelpService.fetchSquads();
        
        this.groups = squads.map((squad) => squad.group as string);
        this.groups = [...new Set(this.groups)];
    }



    async handleCommand(message: Discord.Message, parameters: string[]): Promise<void>{
        if(parameters !== null && parameters.length > 0){
            const user = parameters[0];
            const group = parameters[1];
            
            this.logger.info(`Recieved squad recommendation command for user ${user} for category ${group}`);

            const players = await this.swgohHelpService.fetchPlayers({
                allycodes: [user]
            });
            const player = players[0];
            const playerRoster = player.roster as SwgohHelpPlayerToon[];

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

                response.embed.description += `:star::gear::level_slider::asterisk:\n`;

                if(squads[i].team !== undefined){
                    const squadTeam = squads[i].team as SwgohHelpSquadToon[];

                    const squadRequirements: SquadRequirements[] = [];

                    for(let j=0; j<squadTeam.length; j++){
                        const squadMember = squadTeam[j];
                        const playerToon = playerRoster.find((toon) => toon.defId === squadMember.name);
                        const characterDef = characterDefs.find((char) => char.baseId === squadMember.name);
                        
                        const checkRequirements: SquadRequirements = {
                            requirements: {
                                rarity: false,
                                gear: false,
                                level: false,
                                skills: false,
                            },
                            required: squadMember.required || false,
                            leader: squadMember.leader || false,
                            ready: false,
                            name: ''
                        };

                        if(characterDef && characterDef.nameKey){
                            checkRequirements.name = characterDef.nameKey;
                        }else{
                            checkRequirements.name = squadMember.name || 'Unknown toon';
                        }

                        if(playerToon !== undefined){
                            // const checkRequirements = {
                            checkRequirements.requirements.rarity = this.checkRequirement(squadMember.rarity, playerToon.rarity);
                            checkRequirements.requirements.gear = this.checkRequirement(squadMember.gear, playerToon.gear);
                            checkRequirements.requirements.level = this.checkRequirement(squadMember.level, playerToon.level);
                            checkRequirements.requirements.skills = await this.checkSkills(squadMember.skills || [], playerToon.skills);
                            checkRequirements.ready = checkRequirements.requirements.rarity && checkRequirements.requirements.gear && checkRequirements.requirements.level && checkRequirements.requirements.skills;
                        }
                        
                        squadRequirements.push(checkRequirements);
                    }
                    
                    squadRequirements.forEach((squadMemberRequirement) => {                        
                        response.embed.description += `${Object.keys(squadMemberRequirement.requirements).map((req) => this.requirmentToIcon(squadMemberRequirement.requirements[req])).join('')} `;
                        response.embed.description += ` ${squadMemberRequirement.leader ? '**': ''}${squadMemberRequirement.required ? '*': ''}${squadMemberRequirement.name}${squadMemberRequirement.leader ? '**': ''}${squadMemberRequirement.required ? '*': ''}\n`;
                    });
                }

                await this.discordService.reply(message, response);
            }
        } else {
            await this.discordService.removeReaction(message);
            await message.react('🤷');
            await this.help(message);
        }
    }

    requirmentToIcon(pass: boolean){
        if(pass){
            return ':white_check_mark:';
        } else {
            return ':no_entry_sign:';
        }
    }

    checkRequirement(goal: number | undefined, current: number | undefined){
        if((goal || 0)>(current || 0)){
            return false;
        } else {
            return true;
        }
    }

    async checkSkills(targetSkills: string[], toonSkills: SwgohHelpToonSkill[] | undefined){
        let skillsOk = true;

        if(toonSkills !== undefined && toonSkills.length > 0){
            for(let i=0; i<toonSkills.length; i++){
                skillsOk = skillsOk && await this.checkSkill(targetSkills, toonSkills[i]);
            }
        } else {
            skillsOk = false;
        }

        return skillsOk;
    }

    async checkSkill(targetSkills: string[], toonSkill: SwgohHelpToonSkill){
        if(toonSkill.tier){
            const skills = await this.swgohHelpService.fetchSkillList(toonSkill.id);
            const skill = skills[0] as SwgohHelpSkills;

            if(toonSkill.isZeta){
                const inRequiredList = targetSkills.find((requiredSkill) => requiredSkill === toonSkill.id);
                if(inRequiredList){
                    return toonSkill.tier === (skill.tiers || 7) + 1;
                } else {
                    return toonSkill.tier >= (skill.tiers || 7);
                }
            } else {
                // FIXME: Some skills have max tier 7, need a way to check max skill level
                return toonSkill.tier >= (skill.tiers || 7);
            }
        } else {
            return false;
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