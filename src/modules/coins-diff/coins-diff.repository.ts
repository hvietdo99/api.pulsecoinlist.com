import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { FilterQuery, Model } from 'mongoose';
import { EDbModel } from 'src/shares/enums';
import { parseQueryOptions } from 'src/shares/helpers';
import { IPagination, IPaginateModel } from 'src/shares/pagination';
import { ESortingType, ISorting } from 'src/shares/sorting';
import { CoinDiffDocument } from './coin-diff.schema';
import { ICoinDiff } from './coins-diff.interface';

@Injectable()
export class CoinsDiffRepository {
  constructor(
    @InjectModel(EDbModel.COIN_DIFF)
    private readonly coinDiffModel: Model<CoinDiffDocument>,
  ) {}

  async filterByConditions(
    conditions: FilterQuery<CoinDiffDocument>,
    pagination?: IPagination,
    sorting?: ISorting,
  ): Promise<IPaginateModel<CoinDiffDocument>> {
    const options = parseQueryOptions(
      pagination,
      !!sorting && !!sorting.sortBy
        ? sorting
        : {
            sortBy: 'tvlInPLS',
            sortType: ESortingType.DESC,
          },
    );

    const results = await (this.coinDiffModel as any).paginate(
      conditions,
      options,
    );
    return results;
  }

  async saveCoinDiff(dto: ICoinDiff): Promise<void> {
    await this.coinDiffModel.updateOne(
      {
        address: dto.address.toLowerCase(),
      },
      {
        name: dto.name,
        symbol: dto.symbol,
        decimals: dto.decimals,
        isVerified: dto.isVerified,
        priceInPLS: Decimal128.fromString(dto.priceInPLS || '0'),
        priceInETH: Decimal128.fromString(dto.priceInETH || '0'),
        percentDiff: dto.percentDiff,
        tvlInPLS: Decimal128.fromString(dto.tvlInPLS || '0'),
        tvlInETH: Decimal128.fromString(dto.tvlInETH || '0'),
        recommendEx: dto.recommendEx,
      },
      {
        upsert: true,
      },
    );
  }

  async saveLogo(address: string, url: string): Promise<void> {
    await this.coinDiffModel.updateOne(
      {
        address: address.toLowerCase(),
      },
      {
        logo: url,
      },
    );
  }

  async reset(): Promise<void> {
    await this.coinDiffModel.deleteMany({});
  }
}
