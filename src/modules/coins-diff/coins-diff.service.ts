import { Injectable } from '@nestjs/common';
import { IPagination } from 'src/shares/pagination';
import { ISorting } from 'src/shares/sorting';
import { ICoinDiff } from './coins-diff.interface';
import { CoinsDiffRepository } from './coins-diff.repository';

@Injectable()
export class CoinsDiffService {
  constructor(private readonly repository: CoinsDiffRepository) {}

  async listCoinsDiff(
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

  async saveCoin(coin: ICoinDiff) {
    await this.repository.saveCoinDiff(coin);
    return;
  }

  async saveLogo(address: string, url: string) {
    await this.repository.saveLogo(address, url);
  }

  async reset() {
    await this.repository.reset();
    return;
  }
}
