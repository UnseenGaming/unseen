import * as mongoose from 'mongoose';

import { prop } from 'typegoose';
import { arrayProp } from 'typegoose';
import { ModelType } from 'typegoose';
import { InstanceType } from 'typegoose';
import { Typegoose } from 'typegoose';

export class SwgohHelpSquadToon {
    @prop()
    name: string;

    @prop()
    rarity?: number;

    @prop()
    level?: number;

    @prop()
    gear?: number;

    @arrayProp({ items: String })
    skills: string[];
}


export class SwgohHelpSquad extends Typegoose {
    @prop()
    id?: string;

    @prop()
    group?: string;

    @prop()
    groupName?: string;

    @prop()
    phase?: string;

    @prop()
    name?: string;

    @prop()
    note?: string;

    @prop()
    url?: string;

    @arrayProp({ items: SwgohHelpSquadToon })
    team?: SwgohHelpSquadToon[];
}

export const SwgohHelpSquadModel = new SwgohHelpSquad().getModelForClass(SwgohHelpSquad);