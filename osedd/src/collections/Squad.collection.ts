import * as mongoose from 'mongoose';

import { prop } from 'typegoose';
import { arrayProp } from 'typegoose';
import { ModelType } from 'typegoose';
import { InstanceType } from 'typegoose';
import { Typegoose } from 'typegoose';

export class SwgohHelpSquadToon {
    @prop()
    name?: string; // ID name of toon

    @prop()
    rarity?: number; // Number of stars required

    @prop()
    level?: number; // Level required

    @prop()
    gear?: number; // Level of gear required, only supports full gear level at the moment

    @arrayProp({ items: String })
    skills?: string[]; // Array of required skills

    @prop()
    required?: boolean; // Required toon for this squad

    @prop()
    leader?: boolean; // Leader
}


export class SwgohHelpSquad extends Typegoose {
    @prop()
    id?: string; // Internal id, can be ignored when generating

    @prop()
    group?: string; // Name of group this squad is useful for, for example hstr etc.

    @prop()
    groupName?: string; // Long description of the group above

    @prop()
    phase?: string; // If useful for a particular phase, for example hSTR Phase 2

    @prop()
    name?: string; // Name of the squad, for example 'Chex Mix'

    @prop()
    note?: string; // Any extra info

    @prop()
    url?: string; // Not used

    @arrayProp({ items: SwgohHelpSquadToon })
    team?: SwgohHelpSquadToon[];
}

// tslint:disable-next-line:variable-name
export const SwgohHelpSquadModel = new SwgohHelpSquad().getModelForClass(SwgohHelpSquad);