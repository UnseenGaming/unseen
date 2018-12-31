import * as ApiSwgohHelp from 'api-swgoh-help';

import { LoggerService } from "./logger.service";
import { SwgohHelpPlayer } from '../collections/Player.collection';
import { SwgohHelpPlayerModel } from '../collections/Player.collection';


export class SwgohHelpService {
    private static instance: SwgohHelpService;
    private logger: LoggerService;
    private swapi: ApiSwgohHelp; 

    constructor(
        private username: string,
        private password: string
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

    async fetchPlayer(payload: {
        allycodes: string[],
        language?: string,
        enums?: boolean,
        structure?: boolean,
        project?: string
    }): Promise<SwgohHelpPlayer[]>{
        let { result, error, warning } = await this.swapi.fetchPlayer( payload );

        for(let i=0; i<result.length;i++){
            const playerData = new SwgohHelpPlayerModel(result[0]);

            try{
                await playerData.save();
            } catch(error){
                this.logger.error(`Couldn't save player to db: ${error.message}`)
            }
        }

        return result;
    }

    async fetchSquads() {
        let { result, error, warning } = await this.swapi.fetchSquads();
        console.log('Fetching squads')
        console.log( JSON.stringify(result) );
    }
}
