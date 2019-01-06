import * as mongoose from 'mongoose';

import { prop } from 'typegoose';
import { arrayProp } from 'typegoose';
import { ModelType } from 'typegoose';
import { InstanceType } from 'typegoose';
import { Typegoose } from 'typegoose';

export class SwgohHelpCharacter extends Typegoose {
    @prop()
    id?: string; // Internal id, can be ignored when generating

    @prop()
    nameKey?: string; // Name of group this squad is useful for, for example hstr etc.

    @prop()
    forceAlignment?: string; // Name of group this squad is useful for, for example hstr etc.

    @prop()
    combatType?: string; // Long description of the group above

    @prop()
    descKey?: string; // If useful for a particular phase, for example hSTR Phase 2

    @prop()
    baseId?: string; // Name of the squad, for example 'Chex Mix'

    @arrayProp({ items: String })
    categoryIdList?: string[];
}

// tslint:disable-next-line:variable-name
export const SwgohHelpCharacterModel = new SwgohHelpCharacter().getModelForClass(SwgohHelpCharacter);