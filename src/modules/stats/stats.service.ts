import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  ADDRESS_ZERO,
  RESOLUTIONS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
  WPLS_ADDRESS,
} from 'src/shares/constants';
import { nonExponential, toBigNumOrZero } from 'src/shares/helpers';
import { ESortingType } from 'src/shares/sorting';
import { CoinsService } from '../coins/coins.service';
import { GraphQLService } from '../graphql/graphql.service';
import { CoinsHolderService } from '../coins-holder/coins-holder.service';
import { CoinsSupplyService } from '../coins-supply/coins-supply.service';
import { CoinMetricsResponseDto } from './dto/stats.dto.response';
import { EpochsService } from '../epochs/epochs.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly coinsService: CoinsService,
    private readonly coinsHolderService: CoinsHolderService,
    private readonly coinsSupplyService: CoinsSupplyService,
    private readonly epochsService: EpochsService,
    private readonly graphService: GraphQLService,
  ) {}

  async summary() {
    const results = await this.coinsService.summary();
    const topCoins = await this.coinsService.listCoins({
      address: {
        $in: [WPLS_ADDRESS, WETH_ADDRESS, WBTC_ADDRESS],
      },
    });

    return {
      ...results,
      topCoins: topCoins.docs,
    };
  }

  async highlight() {
    const topGainers = await this.coinsService.listCoins(
      {
        volume24h: { $gte: 10000 },
        totalLiquidityUSD: { $gte: 25000 },
      },
      {
        page: 1,
        limit: 3,
      },
      {
        sortBy: 'percent24h',
        sortType: ESortingType.DESC,
      },
    );

    const topLosers = await this.coinsService.listCoins(
      {
        volume24h: { $gte: 10000 },
        totalLiquidityUSD: { $gte: 25000 },
      },
      {
        page: 1,
        limit: 3,
      },
      {
        sortBy: 'percent24h',
        sortType: ESortingType.ASC,
      },
    );

    const listed24h = await this.coinsService.listCoins(
      {
        volume24h: { $gte: 1000 },
        totalLiquidityUSD: { $gte: 1000 },
        createdAt: {
          $gte: moment().subtract('2', 'days').startOf('minute').toDate(),
        },
      },
      {
        page: 1,
        limit: 3,
      },
      {
        sortBy: 'percent24h',
        sortType: ESortingType.DESC,
      },
    );

    return {
      topGainers: topGainers.docs,
      topLosers: topLosers.docs,
      listed24h: listed24h.docs,
    };
  }

  async topCoinMetrics() {
    const topCoins = await this.coinsService.listCoins({
      isTop: true,
    });

    const now = Math.ceil(moment.utc().startOf('minutes').valueOf() / 1000);
    const fiveMinutesAgo = Math.ceil(
      moment.utc().subtract(5, 'minutes').startOf('minutes').valueOf() / 1000,
    );
    const oneHourAgo = Math.ceil(
      moment.utc().subtract(1, 'hours').startOf('minutes').valueOf() / 1000,
    );
    const sixHoursAgo = Math.ceil(
      moment.utc().subtract(6, 'hours').startOf('minutes').valueOf() / 1000,
    );
    const oneDayAgo = Math.ceil(
      moment.utc().subtract(1, 'days').startOf('minutes').valueOf() / 1000,
    );

    const [
      holdersAtNow,
      holdersFiveMinutesAgo,
      holdersOneHourAgo,
      holdersSixHoursAgo,
      holdersOneDayAgo,
    ] = await Promise.all([
      this.coinsHolderService.findManyByAddressesAndTimestamp(
        topCoins.docs.map((coin) => coin.address),
        now,
      ),
      this.coinsHolderService.findManyByAddressesAndTimestamp(
        topCoins.docs.map((coin) => coin.address),
        fiveMinutesAgo,
      ),
      this.coinsHolderService.findManyByAddressesAndTimestamp(
        topCoins.docs.map((coin) => coin.address),
        oneHourAgo,
      ),
      this.coinsHolderService.findManyByAddressesAndTimestamp(
        topCoins.docs.map((coin) => coin.address),
        sixHoursAgo,
      ),
      this.coinsHolderService.findManyByAddressesAndTimestamp(
        topCoins.docs.map((coin) => coin.address),
        oneDayAgo,
      ),
    ]);

    const docsWithHoldersStats = topCoins.docs.map((coin) => {
      const now = holdersAtNow.find((h) => !!h && h.address === coin.address);
      const fiveMinutesAgo = holdersFiveMinutesAgo.find(
        (h) => !!h && h.address === coin.address,
      );
      const oneHourAgo = holdersOneHourAgo.find(
        (h) => !!h && h.address === coin.address,
      );
      const sixHoursAgo = holdersSixHoursAgo.find(
        (h) => !!h && h.address === coin.address,
      );
      const oneDayAgo = holdersOneDayAgo.find(
        (h) => !!h && h.address === coin.address,
      );

      return {
        ...plainToInstance(CoinMetricsResponseDto, coin),
        holder5m:
          !!now && !!fiveMinutesAgo ? now.amount - fiveMinutesAgo.amount : 0,
        holder1h: !!now && !!oneHourAgo ? now.amount - oneHourAgo.amount : 0,
        holder6h: !!now && !!sixHoursAgo ? now.amount - sixHoursAgo.amount : 0,
        holder24h: !!now && !!oneDayAgo ? now.amount - oneDayAgo.amount : 0,
      };
    });

    return {
      ...topCoins,
      docs: docsWithHoldersStats,
    };
  }

  async supplyStats(dto: { timeframe: string }) {
    const nowTs = Math.ceil(moment().utc().startOf('minutes').valueOf() / 1000);
    const prevTs = Math.ceil(
      moment()
        .utc()
        .subtract(RESOLUTIONS[dto.timeframe], 'seconds')
        .startOf('minutes')
        .valueOf() / 1000,
    );

    const [latestSupply, prevSupply, inRangeSupplies] = await Promise.all([
      this.coinsSupplyService.getSupplyBy(ADDRESS_ZERO, nowTs, 60),
      this.coinsSupplyService.getSupplyBy(ADDRESS_ZERO, prevTs, 60, 1),
      this.coinsSupplyService.getSuppliesInRange(
        ADDRESS_ZERO,
        prevTs,
        nowTs,
        ['7d', '30d'].includes(dto.timeframe) ? 3600 : 60,
      ),
    ]);

    if (!latestSupply || !prevSupply) {
      return {
        current: '0',
        changes: '0',
        lastSyncedAt: nowTs,
        charts: inRangeSupplies.map((s) => ({
          timestamp: s.timestamp,
          value: nonExponential(new BigNumber(s.totalSupply.toString())),
        })),
      };
    }

    return {
      current: nonExponential(
        new BigNumber(latestSupply.totalSupply.toString()),
      ),
      changes: nonExponential(
        new BigNumber(latestSupply.totalSupply.toString()).minus(
          prevSupply.totalSupply.toString(),
        ),
      ),
      lastSyncedAt: latestSupply.timestamp,
      charts: inRangeSupplies.map((s) => ({
        timestamp: s.timestamp,
        value: nonExponential(new BigNumber(s.totalSupply.toString())),
      })),
    };
  }

  async baseFeesPerGasStats(dto: { timeframe: string }) {
    const nowTs = Math.ceil(moment().utc().startOf('minutes').valueOf() / 1000);
    const prevTs = Math.ceil(
      moment()
        .utc()
        .subtract(RESOLUTIONS[dto.timeframe], 'seconds')
        .startOf('minutes')
        .valueOf() / 1000,
    );
    try {
      const metrics = await this.graphService.getBaseFeesPerGasMetrics(
        ['7d', '30d'].includes(dto.timeframe) ? 3600 : 60,
        prevTs,
        nowTs,
      );

      const charts = metrics.map((m) => {
        return {
          timestamp: m.timestamp,
          value: new BigNumber(m.value).dividedBy(1e9).toNumber(),
        };
      });

      const min = metrics.reduce((value: number, m) => {
        const lowest = new BigNumber(m.value).dividedBy(1e9);
        if (lowest.isLessThan(value)) {
          return lowest.toNumber();
        }
        return value;
      }, new BigNumber(metrics[0]?.value || 0).dividedBy(1e9).toNumber());

      const minBlock = metrics.find((m) =>
        new BigNumber(m.value).dividedBy(1e9).isEqualTo(min),
      );

      const max = metrics.reduce((value: number, m) => {
        const highest = new BigNumber(m.value).dividedBy(1e9);
        if (highest.isGreaterThan(value)) {
          return highest.toNumber();
        }
        return value;
      }, new BigNumber(metrics[0]?.value || 0).dividedBy(1e9).toNumber());
      const maxBlock = metrics.find((m) =>
        new BigNumber(m.value).dividedBy(1e9).isEqualTo(max),
      );

      const sum = metrics.reduce(
        (total: BigNumber, m) => total.plus(m.value),
        new BigNumber(0),
      );
      const average = !!metrics.length
        ? sum.dividedBy(metrics.length).dividedBy(1e9).toNumber()
        : 0;

      return {
        lastSyncedAt: !!metrics.length ? metrics[0].timestamp : nowTs,
        charts: charts.reverse(),
        market: {
          min,
          minBlockNumber: new BigNumber(minBlock?.number || 0).toNumber(),
          max,
          maxBlockNumber: new BigNumber(maxBlock?.number || 0).toNumber(),
          average,
        },
      };
    } catch (err) {
      return null;
    }
  }

  async plsBurnedStats(dto: { timeframe: string }) {
    const nowTs = Math.ceil(moment().utc().startOf('minutes').valueOf() / 1000);
    const prevTs = Math.ceil(
      moment()
        .utc()
        .subtract(RESOLUTIONS[dto.timeframe], 'seconds')
        .startOf('minutes')
        .valueOf() / 1000,
    );

    try {
      const burnts = await this.graphService.getPlsBurned(
        ['7d', '30d'].includes(dto.timeframe) ? 3600 : 60,
        prevTs,
        nowTs,
      );

      const charts = burnts.map((m) => {
        return {
          timestamp: m.timestamp,
          value: new BigNumber(m.total).dividedBy(1e18).toNumber(),
        };
      });

      return {
        lastSyncedAt: burnts[0].timestamp,
        charts: charts.reverse(),
      };
    } catch (err) {
      return null;
    }
  }

  async latestBlocksBurned() {
    try {
      const blocks = await this.graphService.getLatestBlocksBurned();
      const results = blocks.map((block) => {
        return {
          blockNumber: new BigNumber(block.number).toNumber(),
          blockTimestamp: new BigNumber(block.timestamp).toNumber(),
          baseFeePerGas: new BigNumber(block.baseFeePerGas)
            .dividedBy(1e9)
            .toNumber(),
          burned: new BigNumber(block.burned).dividedBy(1e18).toNumber(),
        };
      });
      return { blocks: results };
    } catch (err) {
      return { blocks: [] };
    }
  }

  async topBlocksBurned(dto: { timeframe: string }) {
    const nowTs = Math.ceil(moment().utc().startOf('minutes').valueOf() / 1000);
    const prevTs = Math.ceil(
      moment()
        .utc()
        .subtract(RESOLUTIONS[dto.timeframe], 'seconds')
        .startOf('minutes')
        .valueOf() / 1000,
    );

    try {
      const blocks = await this.graphService.getTopBlocksBurned(prevTs, nowTs);
      const results = blocks.map((block) => {
        return {
          blockNumber: new BigNumber(block.number).toNumber(),
          blockTimestamp: new BigNumber(block.timestamp).toNumber(),
          baseFeePerGas: new BigNumber(block.baseFeePerGas)
            .dividedBy(1e9)
            .toNumber(),
          burned: new BigNumber(block.burned).dividedBy(1e18).toNumber(),
        };
      });
      return { blocks: results };
    } catch (err) {
      return { blocks: [] };
    }
  }

  async plsIssuedStats(dto: { timeframe: string }) {
    const nowTs = Math.ceil(moment().utc().startOf('minutes').valueOf() / 1000);
    const prevTs = Math.ceil(
      moment()
        .utc()
        .subtract(RESOLUTIONS[dto.timeframe], 'seconds')
        .startOf('minutes')
        .valueOf() / 1000,
    );

    const issuedPlsInRange = await this.epochsService.getEpochStatsInRange(
      prevTs,
      nowTs,
      ['7d', '30d'].includes(dto.timeframe) ? 3600 : 60,
    );
    if (!issuedPlsInRange || !issuedPlsInRange.length) {
      return {
        latestSyncedAt: nowTs,
        charts: [],
      };
    }

    return {
      latestSyncedAt: issuedPlsInRange[issuedPlsInRange.length - 1].timestamp,
      charts: issuedPlsInRange.map((item) => ({
        timestamp: item.timestamp,
        value: toBigNumOrZero(item.totalIssued.toString())
          .dividedBy(1e18)
          .toNumber(),
      })),
    };
  }
}
