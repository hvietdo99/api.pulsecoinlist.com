import { Injectable } from '@nestjs/common';
import { EpochsRepository } from './epochs.repository';
import { ICreateEpoch, ICreateOrUpdateEpochStats } from './epochs.interface';

@Injectable()
export class EpochsService {
  constructor(private readonly repository: EpochsRepository) {}

  async createEpoch(dto: ICreateEpoch): Promise<void> {
    await this.repository.createEpoch(dto);
    return;
  }

  async findLatestEpoch() {
    const epoch = await this.repository.findLatestEpoch();
    return epoch;
  }

  async createOrUpdateEpochStats(dto: ICreateOrUpdateEpochStats) {
    const stats = await this.repository.createOrUpdateEpochStats(dto);
    return stats;
  }

  async getEpochStatsInRange(
    fromTimestamp: number,
    toTimestamp: number,
    resolution: number = 60,
  ) {
    return this.repository.getEpochStatsInRange(
      fromTimestamp,
      toTimestamp,
      resolution,
    );
  }
}
