import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class CoinSupply {
  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  address: string;

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
  totalSupply: Decimal128;
}

export type CoinSupplyDocument = CoinSupply & Document;

export const CoinSupplySchema = SchemaFactory.createForClass(CoinSupply);

CoinSupplySchema.plugin(MongoosePaginate);

CoinSupplySchema.index(
  { address: 1, resolution: 1, timestamp: 1 },
  { unique: true },
);

CoinSupplySchema.index({ timestamp: 1 });
