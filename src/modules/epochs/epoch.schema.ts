import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class Epoch {
  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  epoch: number;

  @Prop({
    type: SchemaTypes.Number,
    required: true,
  })
  totalValidators: number;

  @Prop({
    type: SchemaTypes.Number,
    required: true,
  })
  averageBalance: number;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  issued: Decimal128;
}

export type EpochDocument = Epoch & Document;

export const EpochSchema = SchemaFactory.createForClass(Epoch);

EpochSchema.plugin(MongoosePaginate);

EpochSchema.index({ epoch: 1 }, { unique: true });
