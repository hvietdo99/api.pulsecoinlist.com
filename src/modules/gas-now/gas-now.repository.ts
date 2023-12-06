import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Decimal128 } from 'bson';
import { EDbModel } from 'src/shares/enums';
import { GasNowDocument } from './gas-now.schema';
import { ICreateGasNow } from './gas-now.interface';

@Injectable()
export class GasNowRepository {
  constructor(
    @InjectModel(EDbModel.GAS_NOW)
    private readonly gasNowModel: Model<GasNowDocument>,
  ) {}

  async save(dto: ICreateGasNow): Promise<void> {
    await this.gasNowModel.findOneAndUpdate(
      {
        resolution: dto.resolution,
        timestamp: dto.timestamp,
      },
      {
        rapid: Decimal128.fromString(dto.rapid),
        fast: Decimal128.fromString(dto.fast),
        standard: Decimal128.fromString(dto.standard),
        slow: Decimal128.fromString(dto.slow),
      },
      {
        upsert: true,
      },
    );
  }

  async getLatest(resolution: number = 60): Promise<GasNowDocument> {
    return this.gasNowModel
      .findOne({
        resolution,
      })
      .sort({ timestamp: 'desc' });
  }

  async getMultiInRange(
    fromTimestamp: number,
    toTimestamp: number,
    resolution: number = 60,
  ): Promise<GasNowDocument[]> {
    return this.gasNowModel
      .find({
        timestamp: { $gte: fromTimestamp, $lte: toTimestamp },
        resolution,
      })
      .sort({ timestamp: 'asc' });
  }

  async reset(): Promise<void> {
    await this.gasNowModel.deleteMany({});
  }
}
