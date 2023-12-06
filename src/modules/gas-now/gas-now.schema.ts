import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class GasNow {
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
  rapid: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  fast: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  standard: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  slow: Decimal128;
}

export type GasNowDocument = GasNow & Document;

export const GasNowSchema = SchemaFactory.createForClass(GasNow);

GasNowSchema.plugin(MongoosePaginate);

GasNowSchema.index({ resolution: 1, timestamp: 1 }, { unique: true });
GasNowSchema.index({ timestamp: 1 });
