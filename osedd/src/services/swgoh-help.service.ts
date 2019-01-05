import * as ApiSwgohHelp from 'api-swgoh-help';
import * as cloneDeep from 'lodash.clonedeep';
import { InstanceType } from 'typegoose';
import * as fs from 'fs-extra';

import { LoggerService } from "./logger.service";
import { SwgohHelpPlayer } from '../collections/Player.collection';
import { SwgohHelpPlayerModel } from '../collections/Player.collection';

import { SwgohHelpSquad } from '../collections/Squad.collection';
import { SwgohHelpSquadModel } from '../collections/Squad.collection';
import { SwgohHelpCharacterModel } from '../collections/Character.collection';
import { SwgohHelpSkillsModel } from '../collections/Skills.collection';
import { SwgohHelpCharacter } from '../collections/Character.collection';
import { SwgohHelpSkills } from '../collections/Skills.collection';

export class SwgohHelpService {
    private static instance: SwgohHelpService;
    private logger: LoggerService;
    private swapi: ApiSwgohHelp; 

    constructor(
        private username?: string,
        private password?: string
    ) {
        if (SwgohHelpService.instance) {
            return SwgohHelpService.instance;
        }

        SwgohHelpService.instance = this;
        this.logger = new LoggerService();

        this.logger.info(`Regestering with swgoh.help with username ${this.username}`);

        this.swapi = new ApiSwgohHelp({
            username: this.username,
            password: this.password
        });

        // this.fetchPlayer({
        //     allycodes: ["675513975"]
        // })

        // this.fetchGuild({
        //     allycodes: ["675513975"]
        // })

        this.fetchUnitList();
        this.fetchSkillList();

        // this.fetchSquads();
    }

    async fetchPlayers(payload: {
        allycodes: string[],
        language?: string,
        enums?: boolean,
        structure?: boolean,
        project?: string
    }): Promise<SwgohHelpPlayer[]>{
        const allycodes = payload.allycodes;
        const swgohAllycodes = [];
        let players: InstanceType<SwgohHelpPlayer>[] = [];

        for(let i=0; i<allycodes.length;i++){
            const allycode = Number.parseInt(payload.allycodes[i]);
            const player = await SwgohHelpPlayerModel.findOne({allyCode: allycode});

            if(player == null){
                swgohAllycodes.push(payload.allycodes[i]);
            } else {
                this.logger.info(`Found player with allycode ${player.allyCode} in database`);
                players.push(player);
            }
        }

        if(swgohAllycodes.length > 0){
            const newPayload = {
                ...payload,
                allycodes: swgohAllycodes
            }

            this.logger.info(`Querying swgoh.help for player allycodes ${newPayload.allycodes.join(', ')}`);
            let { result, error, warning } = await this.swapi.fetchPlayer( newPayload );
            
            for(let i=0; i<result.length;i++){
                const playerData = new SwgohHelpPlayerModel(result[0]);
                
                try{
                    await playerData.save();
                    players.push(playerData);
                } catch(error){
                    this.logger.error(`Couldn't save player to db: ${error.message}`)
                }
            }
        }

        return players;
    }

    async fetchUnitList(baseId?: string): Promise<SwgohHelpCharacter[]> {
        const numberOfCharacter = await SwgohHelpCharacterModel.estimatedDocumentCount();

        if(numberOfCharacter === 0){
            const units = await this.fetchData({
                "collection": "unitsList",
                "language": "eng_us",
                "enums":true,
                "match": {
                    "rarity": 7
                },
                "project": {
                    "baseId": 1,
                    "nameKey": 1,
                    "descKey": 1,
                    "forceAlignment": 1,
                    "categoryIdList": 1,
                    "combatType": 1    
                }
            })

            for(let i=0; i<units.length; i++){
                const dbUnit = new SwgohHelpCharacterModel(units[i]);
                await dbUnit.save();
            }
        }

        if(baseId){
            return await SwgohHelpCharacterModel.find({baseId});
        } else {
            return await SwgohHelpCharacterModel.find();
        }
    }

    async fetchSkillList(nameKey?: string){ //: Promise<SwgohHelpCharacter[]> {
        const numberOfSkills = await SwgohHelpSkillsModel.estimatedDocumentCount();

        if(numberOfSkills === 0){
            const skills = await this.fetchData({
                "collection": "skillList",
                "language": "eng_us",
                "enums":true,
                "project": {
                    "id":1, 
                    "abilityReference":1, 
                    "isZeta":1    
                }
            })

            const abilities = await this.fetchData({
                "collection": "abilityList",
                "language": "eng_us",
                "enums":true,
                "project": {
                    "id":1, 
                    "type":1, 
                    "nameKey":1    
                }
            })

            skills.map((skill) => {
                const skillName = abilities.find((ability) => ability.id === skill.abilityReference);
                if(skillName !== undefined){
                    skill.nameKey = skillName.nameKey;
                }
                return skill;
            })

            for(let i=0; i<skills.length; i++){
                const dbUnit = new SwgohHelpSkillsModel(skills[i]);
                await dbUnit.save();
            }
        }

        if(nameKey){
            return await SwgohHelpCharacterModel.find({nameKey});
        } else {
            return await SwgohHelpCharacterModel.find();
        }
    }

    private async fetchData(payload: {
        collection: "abilityList"
        | "battleEnvironmentsList"
        | "battleTargetingRuleList"
        | "categoryList"
        | "challengeList"
        | "challengeStyleList"
        | "effectList"
        | "environmentCollectionList"
        | "equipmentList"
        | "eventSamplingList"
        | "guildExchangeItemList"
        | "guildRaidList"
        | "helpEntryList"
        | "materialList"
        | "playerTitleList"
        | "powerUpBundleList"
        | "raidConfigList"
        | "recipeList"
        | "requirementList"
        | "skillList"
        | "starterGuildList"
        | "statModList"
        | "statModSetList"
        | "statProgressionList"
        | "tableList"
        | "targetingSetList"
        | "territoryBattleDefinitionList"
        | "territoryWarDefinitionList"
        | "unitsList"
        | "unlockAnnouncementDefinitionList"
        | "warDefinitionList"
        | "xpTableList",
        project?: any,
        match?: any,
        language?: string,
        enums?: boolean
    }){
        let { result, error, warning } = await this.swapi.fetchData( payload );
        return result;
    }

    async fetchSquads(group?: string) {
        const numberOfSquads = await SwgohHelpSquadModel.estimatedDocumentCount();

        if(numberOfSquads === 0){
            // NOTE: The swgoh.help set of squads are far too many and are not good squads at the moment. 
            // this.logger.warn(`No squads in database, initialising collection with swgoh.help`);
            // let { result, error, warning } = await this.swapi.fetchSquads();

            // const groups =Object.keys(result);
            // for(let i=0; i<groups.length; i++){
            //     const resultGroup = result[groups[i]];
                
            //     if( groups[i] == 'updated' ||
            //         groups[i] == 'twcounters' ||
            //         groups[i] == 'twdefense' ){
            //         continue;
            //     }

            //     let squad = {
            //         group: groups[i],
            //         groupName: resultGroup.name
            //     } as SwgohHelpSquad;

            //     const phases = resultGroup.phase;
            //     for(let j=0; j<phases.length; j++){
            //         const resultPhase = resultGroup.phase[j];

            //         squad.phase = resultPhase.name;

            //         const resultSquads = resultPhase.squads;
            //         for( let k=0; k<resultSquads.length; k++){
            //             squad.name = resultSquads[k].name;
            //             squad.note = resultSquads[k].note;
            //             squad.url = resultSquads[k].url;

            //             squad.team = resultSquads[k].team.map((teamMember: string) => {
            //                 const teamMemberParts = teamMember.split(':');
            //                 const teamMemberName = teamMemberParts.shift();
            //                 return {
            //                     rarity: resultGroup.rarity,
            //                     gear: resultGroup.gear,
            //                     level: resultGroup.level,
            //                     name: teamMemberName,
            //                     skills: teamMemberParts
            //                 }
            //             });

            //             const dbSquad = new SwgohHelpSquadModel(cloneDeep(squad));
            //             await dbSquad.save();
            //         }
            //     }
            // }
            const squads = await fs.readJSON(`./data/squads.json`);
            for(let i=0; i<squads.length; i++){
                const dbSquad = new SwgohHelpSquadModel(squads[i]);
                await dbSquad.save();
            }
        }

        if(group){
            return await SwgohHelpSquadModel.find({group});
        } else {
            return await SwgohHelpSquadModel.find();
        }
    }

    async fetchGuild(payload: {
        allycodes: string[],
        language?: string,
        enums?: boolean,
        structure?: boolean,
        project?: string
    }){
        let { result, error, warning } = await this.swapi.fetchGuild( payload );
        console.log(result);
    }
}
