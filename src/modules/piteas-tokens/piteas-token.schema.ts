import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document } from 'mongoose';
import * as MongoosePaginate from 'mongoose-paginate-v2';

@Schema({
  timestamps: true,
})
export class PiteasToken {
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
    required: true,
  })
  decimals: number;

  @Prop({
    type: SchemaTypes.String,
    required: true,
  })
  logoURI: string;
}

export type PiteasTokenDocument = PiteasToken & Document;

export const PiteasTokenSchema = SchemaFactory.createForClass(PiteasToken);

PiteasTokenSchema.plugin(MongoosePaginate);

PiteasTokenSchema.index({ address: 1 }, { unique: true });
