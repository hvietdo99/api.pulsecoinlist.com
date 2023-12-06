import { Injectable } from '@nestjs/common';
import { IPagination } from 'src/shares/pagination';
import { ISorting } from 'src/shares/sorting';
import { ICoinBuyAndSell, ICoinMetadata, ICoinStats } from './coins.interface';
import { CoinsRepository } from './coins.repository';

@Injectable()
export class CoinsService {
  constructor(private readonly repository: CoinsRepository) {}

  async count(conditions: Record<string, any>): Promise<number> {
    const result = await this.repository.countByConditions(conditions);
    return result;
  }

  async summary() {
    const results = await this.repository.summary();
    return results;
  }

  async listCoins(
    conditions: Record<string, any>,
    pagination?: IPagination,
    sorting?: ISorting,
  ) {
    const results = await this.repository.filterByConditions(
      conditions,
      pagination,
      sorting,
    );
    return results;
  }

  async detailCoinByAddress(address: string) {
    const coin = await this.repository.findByAddress(address);
    return coin;
  }

  async detailCoinBySlug(slug: string) {
    const coin = await this.repository.findBySlug(slug);
    return coin;
  }

  async save(dto: ICoinMetadata & ICoinStats): Promise<void> {
    await this.repository.save(dto);
    return;
  }

  async saveCoinMetadata(dto: ICoinMetadata): Promise<void> {
    await this.repository.saveCoinMetadata(dto);
    return;
  }

  async saveCoinStats(dto: ICoinStats) {
    await this.repository.saveCoinStats(dto);
    return;
  }

  async saveBuysAndSells(address: string, dto: ICoinBuyAndSell) {
    await this.repository.saveBuysAndSells(address, dto);
  }

  async saveHolders(address: string, holders: number) {
    await this.repository.saveHolders(address, holders);
  }

  async saveLogo(address: string, url: string) {
    await this.repository.saveLogo(address, url);
  }

  async reset() {
    await this.repository.reset();
    return;
  }
}
