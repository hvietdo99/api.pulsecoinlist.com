import { Injectable } from '@nestjs/common';
import { CoinsSupplyRepository } from './coins-supply.repository';
import { ICreateCoinSupply } from './coins-supply.interface';

@Injectable()
export class CoinsSupplyService {
  constructor(private readonly repository: CoinsSupplyRepository) {}

  async save(dto: ICreateCoinSupply) {
    await this.repository.save(dto);
  }

  async getLatestSupplyByAddress(address: string, resolution: number) {
    const result = await this.repository.getLatestSupplyByAddress(
      address,
      resolution,
    );
    if (!result) {
      return null;
    }

    return result;
  }

  async getSupplyBy(
    address: string,
    timestamp: number,
    resolution: number = 60,
    skip?: number,
  ) {
    return this.repository.getSupplyBy(address, timestamp, resolution, skip);
  }

  async getSuppliesInRange(
    address: string,
    fromTimestamp: number,
    toTimestamp: number,
    resolution: number = 60,
  ) {
    return this.repository.getSuppliesInRange(
      address,
      fromTimestamp,
      toTimestamp,
      resolution,
    );
  }

  async reset() {
    await this.repository.reset();
    return;
  }
}
