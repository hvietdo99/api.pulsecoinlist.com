import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EDbModel } from 'src/shares/enums';
import { CoinHolderDocument } from './coin-holder.schema';
import { ICreateCoinHolder } from './coins-holder.interface';

@Injectable()
export class CoinsHolderRepository {
  constructor(
    @InjectModel(EDbModel.COIN_HOLDER)
    private readonly coinHolderModel: Model<CoinHolderDocument>,
  ) {}

  async save(dto: ICreateCoinHolder) {
    await this.coinHolderModel.findOneAndUpdate(
      {
        address: dto.address.toLowerCase(),
        resolution: dto.resolution,
        timestamp: dto.timestamp,
      },
      {
        amount: dto.amount,
      },
      { upsert: true },
    );
  }

  async findOneNearestByAddressAtTimestamp(
    address: string,
    timestamp: number,
    resolution: number = 60,
  ): Promise<CoinHolderDocument> {
    const result = await this.coinHolderModel
      .findOne({
        address,
        resolution,
        timestamp: { $lte: timestamp },
      })
      .sort({ updatedAt: 'desc' });
    return result;
  }

  async reset(): Promise<void> {
    await this.coinHolderModel.deleteMany({});
  }
}
