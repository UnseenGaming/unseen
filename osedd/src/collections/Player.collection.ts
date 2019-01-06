import * as mongoose from 'mongoose';

import { prop } from 'typegoose';
import { arrayProp } from 'typegoose';
import { ModelType } from 'typegoose';
import { InstanceType } from 'typegoose';
import { instanceMethod } from 'typegoose';
import { Typegoose } from 'typegoose';

export class SwgohHelpArenaSquadMember {
    @prop()
    id?: string;

    @prop()
    defId?: string;

    @prop()
    squadUnitType?: number;
}

export class SwgohHelpArenaSquad {
    @prop()
    rank?: number;

    @arrayProp({ items: SwgohHelpArenaSquadMember })
    squad?: SwgohHelpArenaSquadMember[];
}

export class SwgohHelpArenaTeams {
    @arrayProp({ items: SwgohHelpArenaSquad })
    char?: SwgohHelpArenaSquad[];

    @arrayProp({ items: SwgohHelpArenaSquad })
    ship?: SwgohHelpArenaSquad[];
}

export class SwgohHelpPlayerStat {
    @prop()
    nameKey?: string;

    @prop()
    value?: string;

    @prop()
    index?: number;
}

export class SwgohHelpToonEquipmentSlot {
    @prop()
    equipmentId?: string;

    @prop()
    slot?: number;

    @prop()
    nameKey?: string;
}

export class SwgohHelpToonSkill {
    @prop()
    id?: string;

    @prop()
    tier?: number;

    @prop()
    nameKey?: string;

    @prop()
    isZeta?: boolean;
}

export class SwgohHelpModStat {
    @prop()
    unitStat?: number;

    @prop()
    value?: number;

    @prop()
    roll?: number;
}

export class SwgohHelpToonMod {
    @prop()
    id?: string;

    @prop()
    level?: number;

    @prop()
    tier?: number;

    @prop()
    slot?: number;

    @prop()
    set?: number;

    @prop()
    pips?: number;

    @prop()
    primaryStat?: SwgohHelpModStat;

    @arrayProp({ items: SwgohHelpModStat })
    secondaryStat?: SwgohHelpModStat[];
}

export class SwgohHelpPlayerToon {
    @prop()
    id?: string;

    @prop()
    defId?: string;

    @prop()
    nameKey?: string;

    @prop()
    rarity?: number;

    @prop()
    level?: number;

    @prop()
    xp?: number;

    @prop()
    gear?: number;

    @arrayProp({items: SwgohHelpToonEquipmentSlot})
    equipped?: SwgohHelpToonEquipmentSlot[];

    @prop()
    combatType?: number;

    @arrayProp({ items: SwgohHelpToonSkill})
    skills?: SwgohHelpToonSkill[];

    @arrayProp({ items: SwgohHelpToonMod})
    mods?: SwgohHelpToonMod[];

    // @arrayProp()
    // crew: something;
    // Not very populated, fotf has this:
    /*
                      "unitId":"FIRSTORDERTIEPILOT",
                  "slot":0,
                  "skillReferenceList":[  
                     {  
                        "skillId":"specialskill_TIEFIGHTERFIRSTORDER01",
                        "requiredTier":0,
                        "requiredRarity":1
                     }
                  ],
                  "gp":4634,
                  "cp":5793
    */

    @prop()
    gp?: number;
}


export class SwgohHelpPlayer extends Typegoose {
    @prop()
    id?: string;

    @prop()
    allyCode?: number;

    @prop()
    name?: string;

    @prop()
    level?: number;

    @prop()
    titles?: any; // not sure if this works as intended

    @prop()
    guildRefId?: string;

    @prop()
    guildName?: string;

    @prop()
    guildBannerColor?: string;

    @prop()
    guildBannerLogo?: string;

    @prop()
    guildTypeId?: string;

    @arrayProp({ items: SwgohHelpPlayerStat })
    stats?: SwgohHelpPlayerStat[];

    @arrayProp({ items: SwgohHelpPlayerToon })
    roster?: SwgohHelpPlayerToon[];

    @prop()
    arena?: SwgohHelpArenaTeams;

    @prop()
    updated?: number;
}

// tslint:disable-next-line:variable-name
export const SwgohHelpPlayerModel = new SwgohHelpPlayer().getModelForClass(SwgohHelpPlayer);