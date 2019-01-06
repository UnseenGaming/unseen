import * as mongoose from 'mongoose';

import { prop } from 'typegoose';
import { arrayProp } from 'typegoose';
import { ModelType } from 'typegoose';
import { InstanceType } from 'typegoose';
import { Typegoose } from 'typegoose';

export class SwgohHelpSkills extends Typegoose {
    @prop()
    id?: string; // ID of the skill

    @prop()
    abilityReference?: string; // Name of group this squad is useful for, for example hstr etc.

    @prop()
    isZeta?: boolean; // Name of group this squad is useful for, for example hstr etc.

    @prop()
    nameKey?: string;
}

// tslint:disable-next-line:variable-name
export const SwgohHelpSkillsModel = new SwgohHelpSkills().getModelForClass(SwgohHelpSkills);