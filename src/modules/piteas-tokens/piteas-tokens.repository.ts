import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EDbModel } from 'src/shares/enums';
import { ICreatePiteasToken } from './piteas-token.interface';
import { PiteasTokenDocument } from './piteas-token.schema';

@Injectable()
export class PiteasTokensRepository {
  constructor(
    @InjectModel(EDbModel.PITEAS_TOKEN)
    private readonly model: Model<PiteasTokenDocument>,
  ) {}

  async createPiteasToken(
    dto: ICreatePiteasToken | ICreatePiteasToken[],
  ): Promise<PiteasTokenDocument> {
    const result = await this.model.create(dto);
    return result;
  }

  async findAll(): Promise<PiteasTokenDocument[]> {
    const results = await this.model.find({});
    return results;
  }
}
