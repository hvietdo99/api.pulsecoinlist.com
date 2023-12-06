import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EDbModel } from 'src/shares/enums';
import { CoinSupplyDocument } from './coin-supply.schema';
import { ICreateCoinSupply } from './coins-supply.interface';

@Injectable()
export class CoinsSupplyRepository {
  constructor(
    @InjectModel(EDbModel.COIN_SUPPLY)
    private readonly coinSupplyModel: Model<CoinSupplyDocument>,
  ) {}

  async save(dto: ICreateCoinSupply) {
    await this.coinSupplyModel.findOneAndUpdate(
      {
        address: dto.address,
        resolution: dto.resolution,
        timestamp: dto.timestamp,
      },
      {
        totalSupply: dto.totalSupply,
      },
      { upsert: true },
    );
  }

  async getLatestSupplyByAddress(
    address: string,
    resolution: number,
  ): Promise<CoinSupplyDocument> {
    return this.coinSupplyModel
      .findOne({
        address,
        resolution,
      })
      .sort({ timestamp: 'desc' });
  }

  async getSupplyBy(
    address: string,
    timestamp: number,
    resolution: number = 60,
    skip?: number,
  ): Promise<CoinSupplyDocument> {
    const results = await this.coinSupplyModel
      .find({
        address,
        timestamp: { $lte: timestamp },
        resolution,
      })
      .limit(1)
      .skip(skip)
      .sort({ timestamp: 'desc' });
    return results[0];
  }

  async getSuppliesInRange(
    address: string,
    fromTimestamp: number,
    toTimestamp: number,
    resolution: number = 60,
  ): Promise<CoinSupplyDocument[]> {
    return this.coinSupplyModel
      .find({
        address,
        timestamp: { $gte: fromTimestamp, $lte: toTimestamp },
        resolution,
      })
      .sort({ timestamp: 'asc' });
  }

  async reset(): Promise<void> {
    await this.coinSupplyModel.deleteMany({});
  }
}
