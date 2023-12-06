import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as config from 'config';
import BigNumber from 'bignumber.js';
import {
  ADDRESS_ZERO,
  GRAPHQL_BATCH_LIMIT,
  WPLS_ADDRESS,
} from 'src/shares/constants';
import { ESortingType } from 'src/shares/sorting';
import { ETier } from 'src/shares/enums';
import {
  getTimestampsForChanges,
  nonExponential,
  scaleDown,
  slugify,
} from 'src/shares/helpers';
import { CoinsSupplyService } from 'src/modules/coins-supply/coins-supply.service';
import { ICoinMetadata, ICoinStats } from 'src/modules/coins/coins.interface';
import { CoinsService } from '../../coins/coins.service';
import { GraphQLService } from '../../graphql/graphql.service';
import { BaseIntervalCrawler } from './base-interval.process';

@Injectable()
export class FetchCoinsStatsProcess extends BaseIntervalCrawler {
  constructor(
    private readonly graphQLService: GraphQLService,
    private readonly coinsService: CoinsService,
    private readonly coinsSupplyService: CoinsSupplyService,
  ) {
    super(FetchCoinsStatsProcess.name);
  }

  protected async prepare(): Promise<void> {
    this.setNextTickTimer(1000);
  }

  protected async doProcess(): Promise<void> {
    console.log('------------------PROCESSING------------------');

    let conditions: Record<string, any> = {
      address: { $ne: ADDRESS_ZERO },
    };
    const tier = config.get<ETier>('processor.tier');
    console.log(`Fetching coins of tier: ${tier}...`);
    if (tier === ETier.TIER2) {
      conditions = {
        ...conditions,
        volume24h: { $gte: 1000 },
        updatedAt: { $lte: moment().subtract('1', 'minutes').toDate() },
      };
    } else if (tier === ETier.TIER1) {
      conditions = {
        ...conditions,
        volume24h: {
          $gt: 0,
          $lt: 1000,
        },
        updatedAt: {
          $lte: moment().subtract('5', 'minutes').toDate(),
        },
      };
    } else if (tier === ETier.TIER0) {
      conditions = {
        ...conditions,
        volume24h: 0,
        updatedAt: { $lte: moment().subtract('15', 'minutes').toDate() },
      };
    }

    const coins = await this.coinsService.listCoins(
      conditions,
      {
        page: 0,
        limit: GRAPHQL_BATCH_LIMIT,
      },
      { sortBy: 'updatedAt', sortType: ESortingType.ASC },
    );
    if (!coins || !coins.docs || !coins.docs.length) {
      return;
    }

    const timestamps = getTimestampsForChanges();
    const blocks = await this.graphQLService.getBlocks(timestamps);
    const coinsStats = await this.graphQLService.fetchCoinsStats(
      coins.docs.map((coin) => ({
        id: coin.address,
        name: coin.name,
        symbol: coin.symbol,
        decimals: coin.decimals,
        totalSupply: coin.totalSupply.toString(),
      })),
      blocks,
    );

    const wrappedNativeStats = coinsStats.find(
      (stats) => stats.address === WPLS_ADDRESS,
    );
    if (!!wrappedNativeStats) {
      const latestNativeSupply =
        await this.coinsSupplyService.getLatestSupplyByAddress(
          ADDRESS_ZERO,
          60,
        );
      if (!!latestNativeSupply) {
        const totalSupply = nonExponential(
          new BigNumber(latestNativeSupply.totalSupply?.toString()),
        );
        const nativeStats: ICoinMetadata & ICoinStats = {
          address: ADDRESS_ZERO,
          name: 'PulseChain',
          symbol: 'PLS',
          slug: slugify(`PulseChain PLS ${WPLS_ADDRESS}`),
          decimals: 18,
          totalSupply,
          isVerified: true,
          isTop: true,
          price: wrappedNativeStats.price,
          percent5m: wrappedNativeStats.percent5m,
          percent1h: wrappedNativeStats.percent1h,
          percent6h: wrappedNativeStats.percent6h,
          percent24h: wrappedNativeStats.percent24h,
          percent7d: wrappedNativeStats.percent7d,
          volume5m: wrappedNativeStats.volume5m,
          volume1h: wrappedNativeStats.volume1h,
          volume6h: wrappedNativeStats.volume6h,
          volume24h: wrappedNativeStats.volume24h,
          volume7d: wrappedNativeStats.volume7d,
          totalLiquidityUSD: wrappedNativeStats.totalLiquidityUSD,
          marketCap: nonExponential(
            new BigNumber(wrappedNativeStats.price).multipliedBy(
              scaleDown(totalSupply, 18),
            ),
          ),
          recommendEx: wrappedNativeStats.recommendEx,
        };

        await this.coinsService.save(nativeStats);
      }
    }

    await Promise.all(
      coinsStats.map((stats) => this.coinsService.saveCoinStats(stats)),
    );

    console.log('------------------COMPLETED------------------');
  }
}
