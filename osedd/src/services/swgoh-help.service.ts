import * as ApiSwgohHelp from 'api-swgoh-help';
import * as cloneDeep from 'lodash.clonedeep';
import { InstanceType } from 'typegoose';

import { LoggerService } from "./logger.service";
import { SwgohHelpPlayer } from '../collections/Player.collection';
import { SwgohHelpPlayerModel } from '../collections/Player.collection';

import { SwgohHelpSquad } from '../collections/Squad.collection';
import { SwgohHelpSquadModel } from '../collections/Squad.collection';

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

    async fetchSquads(group?: string) {
        const numberOfSquads = await SwgohHelpSquadModel.estimatedDocumentCount();

        if(numberOfSquads === 0){
            this.logger.warn(`No squads in database, initialising collection with swgoh.help`);
            let { result, error, warning } = await this.swapi.fetchSquads();

            const groups =Object.keys(result);
            for(let i=0; i<groups.length; i++){
                const resultGroup = result[groups[i]];
                
                if( groups[i] == 'updated' ||
                    groups[i] == 'twcounters' ||
                    groups[i] == 'twdefense' ){
                    continue;
                }

                let squad = {
                    group: groups[i],
                    groupName: resultGroup.name
                } as SwgohHelpSquad;

                const phases = resultGroup.phase;
                for(let j=0; j<phases.length; j++){
                    const resultPhase = resultGroup.phase[j];

                    squad.phase = resultPhase.name;

                    const resultSquads = resultPhase.squads;
                    for( let k=0; k<resultSquads.length; k++){
                        squad.name = resultSquads[k].name;
                        squad.note = resultSquads[k].note;
                        squad.url = resultSquads[k].url;

                        squad.team = resultSquads[k].team.map((teamMember: string) => {
                            const teamMemberParts = teamMember.split(':');
                            const teamMemberName = teamMemberParts.shift();
                            return {
                                rarity: resultGroup.rarity,
                                gear: resultGroup.gear,
                                level: resultGroup.level,
                                name: teamMemberName,
                                skills: teamMemberParts
                            }
                        });

                        const dbSquad = new SwgohHelpSquadModel(cloneDeep(squad));
                        await dbSquad.save();
                    }
                }
            }
        }

        if(group){
            return await SwgohHelpSquadModel.find({group});
        } else {
            return await SwgohHelpSquadModel.find();
        }
    }
}
