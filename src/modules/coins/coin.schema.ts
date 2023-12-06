import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class Coin {
  @Prop({
    type: SchemaTypes.Number,
    required: false,
  })
  rank?: number;

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
    type: SchemaTypes.String,
    required: false,
  })
  slug?: string;

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
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  totalSupply?: Decimal128;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  isVerified?: boolean;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  isTop?: boolean;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  price?: Decimal128;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  percent5m?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  percent1h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  percent6h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  percent24h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  percent7d?: number;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  volume5m?: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  volume1h?: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  volume6h?: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  volume24h?: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  volume7d?: Decimal128;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  buy5m?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  buy1h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  buy6h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  buy24h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  sell5m?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  sell1h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  sell6h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  sell24h?: number;

  @Prop({
    type: SchemaTypes.Number,
    default: 0,
  })
  holders?: number;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  totalLiquidityUSD?: Decimal128;

  @Prop({
    type: SchemaTypes.Decimal128,
    default: '0',
    get: (v: Decimal128) => v?.toString() || '0',
  })
  marketCap?: Decimal128;

  @Prop({
    type: SchemaTypes.String,
    default: 'pulsexV1',
  })
  recommendEx?: string;
}

export type CoinDocument = Coin & Document;

export const CoinSchema = SchemaFactory.createForClass(Coin);

CoinSchema.plugin(MongoosePaginate);

CoinSchema.index({ address: 1 }, { unique: true });
CoinSchema.index({ address: 1, name: 1, symbol: 1 });
CoinSchema.index({ isVerified: 1 });
CoinSchema.index({ isTop: 1 });
CoinSchema.index({ percent1h: 1 });
CoinSchema.index({ percent24h: 1 });
CoinSchema.index({ percent7d: 1 });
CoinSchema.index({ volume24h: 1 });
CoinSchema.index({ volume7d: 1 });
CoinSchema.index({ totalLiquidityUSD: 1 });
CoinSchema.index({ marketCap: 1 });
CoinSchema.index({ slug: 1 });
CoinSchema.index({ updatedAt: 1 });
