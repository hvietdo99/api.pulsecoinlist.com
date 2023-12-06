import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Decimal128 } from 'bson';
import { EDbModel } from 'src/shares/enums';
import { EpochDocument } from './epoch.schema';
import { ICreateEpoch, ICreateOrUpdateEpochStats } from './epochs.interface';
import { EpochStatsDocument } from './epoch-stats.schema';

@Injectable()
export class EpochsRepository {
  constructor(
    @InjectModel(EDbModel.EPOCH)
    private readonly epochModel: Model<EpochDocument>,
    @InjectModel(EDbModel.EPOCH_STATS)
    private readonly epochStatsModel: Model<EpochStatsDocument>,
  ) {}

  async createEpoch(dto: ICreateEpoch): Promise<EpochDocument> {
    const result = await this.epochModel.create(dto);
    return result;
  }

  async findLatestEpoch(): Promise<EpochDocument> {
    const epoch = await this.epochModel.findOne({}).sort({ epoch: 'desc' });
    return epoch;
  }

  async createOrUpdateEpochStats(
    dto: ICreateOrUpdateEpochStats,
  ): Promise<void> {
    let stats = await this.epochStatsModel.findOne({
      resolution: dto.resolution,
      timestamp: dto.timestamp,
    });
    if (!stats) {
      await this.epochStatsModel.create({
        resolution: dto.resolution,
        timestamp: dto.timestamp,
        totalIssued: dto.issued,
      });
    } else {
      await this.epochStatsModel.findOneAndUpdate(
        {
          resolution: dto.resolution,
          timestamp: dto.timestamp,
        },
        {
          $inc: {
            totalIssued: Decimal128.fromString(dto.issued),
          },
        },
      );
    }

    return;
  }

  async getEpochStatsInRange(
    fromTimestamp: number,
    toTimestamp: number,
    resolution: number = 60,
  ): Promise<EpochStatsDocument[]> {
    return this.epochStatsModel
      .find({
        timestamp: { $gte: fromTimestamp, $lte: toTimestamp },
        resolution,
      })
      .sort({ timestamp: 'asc' });
  }
}
