import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class CoinHolder {
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
    type: SchemaTypes.Number,
    default: 0,
  })
  amount: number;
}

export type CoinHolderDocument = CoinHolder & Document;

export const CoinHolderSchema = SchemaFactory.createForClass(CoinHolder);

CoinHolderSchema.plugin(MongoosePaginate);

CoinHolderSchema.index(
  { address: 1, resolution: 1, timestamp: 1 },
  { unique: true },
);

CoinHolderSchema.index({ timestamp: 1 });
