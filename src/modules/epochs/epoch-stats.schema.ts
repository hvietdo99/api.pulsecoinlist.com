import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class EpochStats {
  @Prop({
    type: SchemaTypes.Number,
    required: true,
  })
  resolution: number;

  @Prop({
    type: SchemaTypes.Number,
    required: true,
  })
  timestamp: number;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  totalIssued: Decimal128;
}

export type EpochStatsDocument = EpochStats & Document;

export const EpochStatsSchema = SchemaFactory.createForClass(EpochStats);

EpochStatsSchema.plugin(MongoosePaginate);

EpochStatsSchema.index({ resolution: 1, timestamp: 1 }, { unique: true });
