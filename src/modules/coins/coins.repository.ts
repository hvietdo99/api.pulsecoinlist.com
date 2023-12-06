import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Decimal128 } from 'bson';
import { FilterQuery, Model } from 'mongoose';
import { EDbModel } from 'src/shares/enums';
import { parseQueryOptions } from 'src/shares/helpers';
import { IPagination, IPaginateModel } from 'src/shares/pagination';
import { ESortingType, ISorting } from 'src/shares/sorting';
import { CoinDocument } from './coin.schema';
import { ICoinBuyAndSell, ICoinMetadata, ICoinStats } from './coins.interface';

@Injectable()
export class CoinsRepository {
  constructor(
    @InjectModel(EDbModel.COIN)
    private readonly coinModel: Model<CoinDocument>,
  ) {}

  async summary(): Promise<{
    totalCoins: number;
    totalMarketCap: string;
    totalLiquidityUSD: string;
    totalVolume24h: string;
  }> {
    const results = await Promise.all([
      this.coinModel.aggregate([
        {
          $group: {
            _id: 1,
            totalCoins: { $sum: 1 },
            totalVolume24h: { $sum: '$volume24h' },
          },
        },
      ]),
      this.coinModel.aggregate([
        {
          $project: {
            price: 1,
            volume7d: 1,
            marketCap: 1,
            totalLiquidityUSD: 1,
          },
        },
        {
          $match: {
            price: { $lte: Decimal128.fromString('100000') },
            volume7d: { $gte: Decimal128.fromString('1000') },
            totalLiquidityUSD: { $lte: Decimal128.fromString('200000000') },
          },
        },
        {
          $group: {
            _id: 2,
            totalMarketCap: { $sum: '$marketCap' },
            totalLiquidityUSD: { $sum: '$totalLiquidityUSD' },
          },
        },
      ]),
    ]);

    return {
      totalCoins: results[0]?.[0]?.totalCoins,
      totalMarketCap: results[1]?.[0]?.totalMarketCap?.toString(),
      totalLiquidityUSD: results[1]?.[0]?.totalLiquidityUSD?.toString(),
      totalVolume24h: results[0]?.[0]?.totalVolume24h?.toString(),
    };
  }

  async countByConditions(
    conditions: FilterQuery<CoinDocument>,
  ): Promise<number> {
    const total = await this.coinModel.countDocuments(conditions);
    return total;
  }

  async filterByConditions(
    conditions: FilterQuery<CoinDocument>,
    pagination?: IPagination,
    sorting?: ISorting,
  ): Promise<IPaginateModel<CoinDocument>> {
    const options = parseQueryOptions(
      pagination,
      !!sorting && !!sorting.sortBy
        ? sorting
        : {
            sortBy: 'volume24h',
            sortType: ESortingType.DESC,
          },
    );

    const results = await (this.coinModel as any).paginate(conditions, options);
    return results;
  }

  async findByAddress(address: string): Promise<CoinDocument> {
    return this.coinModel.findOne({ address });
  }

  async findBySlug(slug: string): Promise<CoinDocument> {
    return this.coinModel.findOne({ slug });
  }

  async save(dto: ICoinMetadata & ICoinStats): Promise<void> {
    await this.coinModel.updateOne(
      {
        address: dto.address.toLowerCase(),
      },
      {
        rank: dto.rank,
        name: dto.name,
        symbol: dto.symbol,
        slug: dto.slug,
        decimals: dto.decimals,
        totalSupply: Decimal128.fromString(dto.totalSupply || '0'),
        isVerified: dto.isVerified,
        isTop: dto.isTop,
        price: Decimal128.fromString(dto.price || '0'),
        percent5m: dto.percent5m,
        percent1h: dto.percent1h,
        percent6h: dto.percent6h,
        percent24h: dto.percent24h,
        percent7d: dto.percent7d,
        volume5m: Decimal128.fromString(dto.volume5m || '0'),
        volume1h: Decimal128.fromString(dto.volume1h || '0'),
        volume6h: Decimal128.fromString(dto.volume6h || '0'),
        volume24h: Decimal128.fromString(dto.volume24h || '0'),
        volume7d: Decimal128.fromString(dto.volume7d || '0'),
        totalLiquidityUSD: Decimal128.fromString(dto.totalLiquidityUSD || '0'),
        marketCap: Decimal128.fromString(dto.marketCap || '0'),
        recommendEx: dto.recommendEx,
      },
      {
        upsert: true,
      },
    );
  }

  async saveCoinMetadata(dto: ICoinMetadata): Promise<void> {
    await this.coinModel.updateOne(
      {
        address: dto.address.toLowerCase(),
      },
      {
        name: dto.name,
        symbol: dto.symbol,
        slug: dto.slug,
        decimals: dto.decimals,
        totalSupply: Decimal128.fromString(dto.totalSupply || '0'),
        isVerified: dto.isVerified,
        isTop: dto.isTop,
      },
      {
        upsert: true,
      },
    );
    return;
  }

  async saveCoinStats(dto: ICoinStats): Promise<void> {
    await this.coinModel.updateOne(
      {
        address: dto.address.toLowerCase(),
      },
      {
        rank: dto.rank,
        price: Decimal128.fromString(dto.price || '0'),
        percent5m: dto.percent5m,
        percent1h: dto.percent1h,
        percent6h: dto.percent6h,
        percent24h: dto.percent24h,
        percent7d: dto.percent7d,
        volume5m: Decimal128.fromString(dto.volume5m || '0'),
        volume1h: Decimal128.fromString(dto.volume1h || '0'),
        volume6h: Decimal128.fromString(dto.volume6h || '0'),
        volume24h: Decimal128.fromString(dto.volume24h || '0'),
        volume7d: Decimal128.fromString(dto.volume7d || '0'),
        totalLiquidityUSD: Decimal128.fromString(dto.totalLiquidityUSD || '0'),
        marketCap: Decimal128.fromString(dto.marketCap || '0'),
        recommendEx: dto.recommendEx,
      },
    );
  }

  async saveBuysAndSells(address: string, dto: ICoinBuyAndSell): Promise<void> {
    await this.coinModel.updateOne(
      {
        address: address.toLowerCase(),
      },
      {
        buy5m: dto.buy5m,
        buy1h: dto.buy1h,
        buy6h: dto.buy6h,
        buy24h: dto.buy24h,
        sell5m: dto.sell5m,
        sell1h: dto.sell1h,
        sell6h: dto.sell6h,
        sell24h: dto.sell24h,
      },
    );
  }

  async saveHolders(address: string, holders: number): Promise<void> {
    await this.coinModel.updateOne(
      {
        address: address.toLowerCase(),
      },
      {
        holders,
      },
    );
  }

  async saveLogo(address: string, url: string): Promise<void> {
    await this.coinModel.updateOne(
      {
        address: address.toLowerCase(),
      },
      {
        logo: url,
      },
    );
  }

  async reset(): Promise<void> {
    await this.coinModel.deleteMany({});
  }
}
