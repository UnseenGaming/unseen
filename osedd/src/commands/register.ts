import { DiscordService } from '../services/discord.service';
import { LoggerService } from '../services/logger.service';

import { SquadRecommendationCommand } from './squad-recommendation.command';
import { RosterRankCommand } from './roster-rank.command';

export const commandRegister = (discordService: DiscordService, prefix: string) =>{
    const logger = new LoggerService();
    logger.info(`Registering commands`);

    discordService.registerCommand('sr', new SquadRecommendationCommand(prefix));
    discordService.registerCommand('rr', new RosterRankCommand(prefix));
};