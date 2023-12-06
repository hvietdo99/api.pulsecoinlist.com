import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class CoinDiff {
  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  address: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  name: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  symbol: string;

  @Prop({
    type: SchemaTypes.Number,
    default: 18,
  })
  decimals: number;

  @Prop({
    type: SchemaTypes.String,
    required: false,
  })
  logo?: string;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  isVerified?: boolean;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  priceInPLS: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  priceInETH: Decimal128;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  percentDiff: number;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  tvlInPLS: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  tvlInETH: Decimal128;

  @Prop({
    type: SchemaTypes.String,
    default: 'pulsexV1',
  })
  recommendEx?: string;
}

export type CoinDiffDocument = CoinDiff & Document;

export const CoinDiffSchema = SchemaFactory.createForClass(CoinDiff);

CoinDiffSchema.plugin(MongoosePaginate);

CoinDiffSchema.index({ address: 1 }, { unique: true });
CoinDiffSchema.index({ address: 1, name: 1, symbol: 1 });
CoinDiffSchema.index({ isVerified: 1 });
CoinDiffSchema.index({ percentDiff: 1 });
CoinDiffSchema.index({ tvlInPLS: 1 });
CoinDiffSchema.index({ tvlInETH: 1 });
