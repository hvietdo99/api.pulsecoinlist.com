import { Injectable } from '@nestjs/common';
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import BigNumber from 'bignumber.js';
import {
  convertRaw2CoinStats,
  convertRaw2DestCoinAnalytic,
  convertRaw2SourceCoinAnalytic,
  nonExponential,
  scaleDown,
  wrapperCoin2Ethereum,
} from 'src/shares/helpers';
import {
  clientBlocks,
  clientBlocks2,
  clientEthV2,
  clientEthV3,
  clientPulseXV1,
  clientPulseXV2,
} from './graphql.client';
import {
  GraphGetBlocksFailed,
  GraphGetBaseFeePerGasMetrics,
  GraphGetTotalPlsBurnedMetrics,
  GraphGetTopBlocksPlsBurnedMetrics,
  GraphGetLatestBlocksPlsBurnedMetrics,
} from './graphql.exception';
import {
  IRawCoinInfo,
  IRawCoinStats,
  IRawDestCoinAnalyticV2,
  IRawDestCoinAnalyticV3,
  IRawSourceCoinAnalytic,
} from './graphql.interface';
import {
  FETCH_COINS_LIST,
  FETCH_DEST_LIST_TOKENS_ANALYTIC_V2,
  FETCH_DEST_LIST_TOKENS_ANALYTIC_V3,
  FETCH_LIST_TOKENS_STATS,
  FETCH_SOURCE_LIST_TOKENS_ANALYTIC,
  GET_BLOCKS,
  GET_BASE_FEE_PER_GAS_METRIC_IN_RANGE,
  GET_TOTAL_PLS_BURNED_IN_RANGE,
  GET_LATEST_BLOCKS_PLS_BURNED_IN_RANGE,
  GET_TOP_BLOCKS_PLS_BURNED_IN_RANGE,
} from './graphql.queries';
import { BlockchainsService } from '../blockchain/blockchain.service';
import * as ERC20 from '../blockchain/abi/ERC20.abi';

@Injectable()
export class GraphQLService {
  constructor(private readonly blockchainsService: BlockchainsService) {}

  async getBlocks(timestamps: number[]): Promise<number[]> {
    console.log(`Fetching blocks`);
    const { data } = await clientBlocks.query({
      query: GET_BLOCKS(timestamps),
      fetchPolicy: 'no-cache',
    });

    if (!data) {
      throw new GraphGetBlocksFailed();
    }

    const blocks = timestamps.map((ts) => data[`t${ts}`][0].number);
    console.log(`Fetched blocks=${JSON.stringify(blocks)}`);
    return blocks;
  }

  async getBaseFeesPerGasMetrics(
    resolution: number,
    fromTs: number,
    toTs: number,
  ): Promise<
    {
      number: string;
      timestamp: string;
      value: string;
    }[]
  > {
    const { data } = await clientBlocks2.query({
      query: GET_BASE_FEE_PER_GAS_METRIC_IN_RANGE(),
      fetchPolicy: 'no-cache',
      variables: {
        resolution,
        fromTs,
        toTs,
      },
    });

    if (!data) {
      throw new GraphGetBaseFeePerGasMetrics();
    }

    return data.metrics;
  }

  async getPlsBurned(
    resolution: number,
    fromTs: number,
    toTs: number,
  ): Promise<
    {
      total: string;
      timestamp: string;
    }[]
  > {
    const { data } = await clientBlocks2.query({
      query: GET_TOTAL_PLS_BURNED_IN_RANGE(),
      fetchPolicy: 'no-cache',
      variables: {
        resolution,
        fromTs,
        toTs,
      },
    });

    if (!data) {
      throw new GraphGetTotalPlsBurnedMetrics();
    }

    return data.burnts;
  }

  async getLatestBlocksBurned(): Promise<
    {
      number: string;
      timestamp: string;
      baseFeePerGas: string;
      burned: string;
    }[]
  > {
    const { data } = await clientBlocks2.query({
      query: GET_LATEST_BLOCKS_PLS_BURNED_IN_RANGE(),
      fetchPolicy: 'no-cache',
    });

    if (!data) {
      throw new GraphGetLatestBlocksPlsBurnedMetrics();
    }

    return data.blocks;
  }

  async getTopBlocksBurned(
    fromTs: number,
    toTs: number,
  ): Promise<
    {
      number: string;
      timestamp: string;
      baseFeePerGas: string;
      burned: string;
    }[]
  > {
    const { data } = await clientBlocks2.query({
      query: GET_TOP_BLOCKS_PLS_BURNED_IN_RANGE(),
      fetchPolicy: 'no-cache',
      variables: {
        fromTs,
        toTs,
      },
    });

    if (!data) {
      throw new GraphGetTopBlocksPlsBurnedMetrics();
    }

    return data.blocks;
  }

  async fetchCoinsDetailV1(
    limit?: number,
    skip?: number,
  ): Promise<IRawCoinInfo[]> {
    return this._fetchCoinsDetailByClient(clientPulseXV1, limit, skip);
  }

  async fetchCoinsDetailV2(
    limit?: number,
    skip?: number,
  ): Promise<IRawCoinInfo[]> {
    return this._fetchCoinsDetailByClient(clientPulseXV2, limit, skip);
  }

  private async _fetchCoinsDetailByClient(
    client: ApolloClient<NormalizedCacheObject>,
    limit?: number,
    skip?: number,
  ): Promise<IRawCoinInfo[]> {
    try {
      const { data } = await client.query({
        query: FETCH_COINS_LIST(),
        variables: {
          limit,
          skip,
        },
        fetchPolicy: 'no-cache',
      });

      if (!data || !data.tokens || !data.tokens.length) {
        return [];
      }

      const coins: IRawCoinInfo[] = data.tokens.map((raw: IRawCoinInfo) => {
        return {
          id: raw.id,
          name: raw.name,
          symbol: raw.symbol,
          decimals: new BigNumber(raw.decimals).toNumber(),
        };
      });

      const supplies = await this.blockchainsService.executeMulticall(
        coins.map((coin) => ({
          address: coin.id,
          abi: ERC20.abi,
          method: 'totalSupply',
          params: [],
        })),
      );

      console.log(
        `Fetched all coins detail, skip=${skip}, limit=${limit}, coins=${JSON.stringify(
          coins,
        )}`,
      );

      return coins.map((coin, idx) => ({
        ...coin,
        totalSupply: nonExponential(
          new BigNumber(supplies[idx]?.toString() || '0'),
        ),
      }));
    } catch (err) {
      console.log('_fetchCoinsDetailByClient::err', err);
      return [];
    }
  }

  async fetchCoinsStats(coins: IRawCoinInfo[], timestamps: number[]) {
    const [v1Stats, v2Stats] = await Promise.all([
      this._fetchCoinsStatsByClient(clientPulseXV1, coins, timestamps),
      this._fetchCoinsStatsByClient(clientPulseXV2, coins, timestamps),
    ]);

    return coins
      .map((coin) => {
        const v1 = v1Stats.find((stats) => stats.address === coin.id);
        const v2 = v2Stats.find((stats) => stats.address === coin.id);

        const commonFields = {
          address: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          decimals: coin.decimals,
        };

        if (
          !!v1 &&
          !!v2 &&
          coin.id.toLowerCase() !== '0x7901a3569679aec3501dbec59399f327854a70fe'
        ) {
          const price = v1.price.plus(v2.price).dividedBy(2);
          return {
            ...commonFields,
            price: nonExponential(price),
            percent5m: v1.percent5m
              .plus(v2.percent5m)
              .dividedBy(2)
              .decimalPlaces(4)
              .toNumber(),
            percent1h: v1.percent1h
              .plus(v2.percent1h)
              .dividedBy(2)
              .decimalPlaces(4)
              .toNumber(),
            percent6h: v1.percent6h
              .plus(v2.percent6h)
              .dividedBy(2)
              .decimalPlaces(4)
              .toNumber(),
            percent24h: v1.percent24h
              .plus(v2.percent24h)
              .dividedBy(2)
              .decimalPlaces(4)
              .toNumber(),
            percent7d: v1.percent7d
              .plus(v2.percent7d)
              .dividedBy(2)
              .decimalPlaces(4)
              .toNumber(),
            volume5m: nonExponential(v1.volume5m.plus(v2.volume5m)),
            volume1h: nonExponential(v1.volume1h.plus(v2.volume1h)),
            volume6h: nonExponential(v1.volume6h.plus(v2.volume6h)),
            volume24h: nonExponential(v1.volume24h.plus(v2.volume24h)),
            volume7d: nonExponential(v1.volume7d.plus(v2.volume7d)),
            totalLiquidityUSD: nonExponential(
              v1.totalLiquidityUSD.plus(v2.totalLiquidityUSD),
            ),
            marketCap: nonExponential(
              price.multipliedBy(
                scaleDown(coin.totalSupply || '0', coin.decimals),
              ),
            ),
            recommendEx: v2.totalLiquidityUSD.isGreaterThan(
              v1.totalLiquidityUSD,
            )
              ? 'pulsexV2'
              : 'pulsexV1',
          };
        }

        if (
          !!v1 &&
          coin.id.toLowerCase() !== '0x7901a3569679aec3501dbec59399f327854a70fe'
        ) {
          return {
            ...commonFields,
            price: nonExponential(v1.price),
            percent5m: v1.percent5m.decimalPlaces(4).toNumber(),
            percent1h: v1.percent1h.decimalPlaces(4).toNumber(),
            percent6h: v1.percent6h.decimalPlaces(4).toNumber(),
            percent24h: v1.percent24h.decimalPlaces(4).toNumber(),
            percent7d: v1.percent7d.decimalPlaces(4).toNumber(),
            volume5m: nonExponential(v1.volume5m),
            volume1h: nonExponential(v1.volume1h),
            volume6h: nonExponential(v1.volume6h),
            volume24h: nonExponential(v1.volume24h),
            volume7d: nonExponential(v1.volume7d),
            totalLiquidityUSD: nonExponential(v1.totalLiquidityUSD),
            marketCap: nonExponential(
              v1.price.multipliedBy(
                scaleDown(coin.totalSupply || '0', coin.decimals),
              ),
            ),
            recommendEx: 'pulsexV1',
          };
        }

        if (!!v2) {
          return {
            ...commonFields,
            price: nonExponential(v2.price),
            percent5m: v2.percent5m.decimalPlaces(4).toNumber(),
            percent1h: v2.percent1h.decimalPlaces(4).toNumber(),
            percent6h: v2.percent6h.decimalPlaces(4).toNumber(),
            percent24h: v2.percent24h.decimalPlaces(4).toNumber(),
            percent7d: v2.percent7d.decimalPlaces(4).toNumber(),
            volume5m: nonExponential(v2.volume5m),
            volume1h: nonExponential(v2.volume1h),
            volume6h: nonExponential(v2.volume6h),
            volume24h: nonExponential(v2.volume24h),
            volume7d: nonExponential(v2.volume7d),
            totalLiquidityUSD: nonExponential(v2.totalLiquidityUSD),
            marketCap: nonExponential(
              v2.price.multipliedBy(
                scaleDown(coin.totalSupply || '0', coin.decimals),
              ),
            ),
            recommendEx: 'pulsexV2',
          };
        }

        return null;
      })
      .filter((s) => s !== null);
  }

  private async _fetchCoinsStatsByClient(
    client: ApolloClient<NormalizedCacheObject>,
    coins: IRawCoinInfo[],
    timestamps: number[],
  ) {
    console.log(
      `Fetching coins stats: ${JSON.stringify(coins.map((coin) => coin.id))}`,
    );
    try {
      const { data } = await client.query({
        query: FETCH_LIST_TOKENS_STATS(timestamps),
        variables: {
          allTokens: coins.map((coin) => coin.id),
        },
        fetchPolicy: 'no-cache',
      });

      if (
        !data ||
        !data.now ||
        !data.fiveMinutesAgo ||
        !data.oneHourAgo ||
        !data.sixHoursAgo ||
        !data.oneDayAgo ||
        !data.oneWeekAgo
      ) {
        return [];
      }

      const stats = coins
        .map((coin) =>
          convertRaw2CoinStats(
            coin,
            data.now.find((c: IRawCoinStats) => c.id === coin.id),
            data.fiveMinutesAgo.find((c: IRawCoinStats) => c.id === coin.id),
            data.oneHourAgo.find((c: IRawCoinStats) => c.id === coin.id),
            data.sixHoursAgo.find((c: IRawCoinStats) => c.id === coin.id),
            data.oneDayAgo.find((c: IRawCoinStats) => c.id === coin.id),
            data.oneWeekAgo.find((c: IRawCoinStats) => c.id === coin.id),
          ),
        )
        .filter((s) => s !== null);

      console.log(`Fetched coins stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (err) {
      console.log('_fetchCoinsStatsByClient::err', err);
      return [];
    }
  }

  async fetchSourceCoinsAnalytic(coins: IRawCoinInfo[]) {
    const [v1Analytics, v2Analytics] = await Promise.all([
      this._fetchSourceCoinsAnalyticByClient(clientPulseXV1, coins),
      this._fetchSourceCoinsAnalyticByClient(clientPulseXV2, coins),
    ]);

    return coins
      .map((coin) => {
        const v1 = v1Analytics.find((analytic) => analytic.id === coin.id);
        const v2 = v2Analytics.find((analytic) => analytic.id === coin.id);

        if (!!v1 && !!v2) {
          return {
            id: coin.id,
            priceInPLS: nonExponential(
              v1.priceInPLS.plus(v2.priceInPLS).dividedBy(2),
            ),
            tvlInPLS: nonExponential(v1.tvlInPLS.plus(v2.tvlInPLS)),
          };
        }

        if (!!v1) {
          return {
            id: coin.id,
            priceInPLS: nonExponential(v1.priceInPLS),
            tvlInPLS: nonExponential(v1.tvlInPLS),
          };
        }

        if (!!v2) {
          return {
            id: coin.id,
            priceInPLS: nonExponential(v2.priceInPLS),
            tvlInPLS: nonExponential(v2.tvlInPLS),
          };
        }

        return null;
      })
      .filter((a) => a !== null);
  }

  private async _fetchSourceCoinsAnalyticByClient(
    client: ApolloClient<NormalizedCacheObject>,
    coins: IRawCoinInfo[],
  ) {
    console.log(
      `Fetching source coins analytic: ${JSON.stringify(
        coins.map((coin) => coin.id),
      )}`,
    );
    try {
      const { data } = await client.query({
        query: FETCH_SOURCE_LIST_TOKENS_ANALYTIC(),
        variables: {
          allTokens: coins.map((coin) => coin.id),
        },
        fetchPolicy: 'no-cache',
      });

      if (
        !data ||
        !data.tokens ||
        !data.tokens.length ||
        !data.bundles ||
        !data.bundles.length
      ) {
        return [];
      }

      const source = coins
        .map((coin) => {
          const analytic = data.tokens.find(
            (c: IRawSourceCoinAnalytic) => c.id === coin.id,
          );
          if (!analytic) {
            return null;
          }

          return convertRaw2SourceCoinAnalytic(
            coin,
            analytic,
            data.bundles[0].plsPrice,
          );
        })
        .filter((s) => s !== null);

      console.log(`Fetched source coins analytic: ${JSON.stringify(source)}`);
      return source;
    } catch (err) {
      console.log('_fetchSourceCoinsAnalyticByClient::err', err);
      return [];
    }
  }

  async fetchDestCoinsAnalytic(coins: IRawCoinInfo[]) {
    const [v2Analytics, v3Analytics] = await Promise.all([
      this._fetchDestCoinsAnalyticV2(coins),
      this._fetchDestCoinsAnalyticV3(coins),
    ]);

    return coins
      .map((coin) => {
        const v2 = v2Analytics.find((analytic) => analytic.id === coin.id);
        const v3 = v3Analytics.find((analytic) => analytic.id === coin.id);

        if (!!v2 && !!v3) {
          return {
            id: coin.id,
            priceInETH: nonExponential(
              v2.priceInETH.plus(v3.priceInETH).dividedBy(2),
            ),
            tvlInETH: nonExponential(v2.tvlInETH.plus(v3.tvlInETH)),
          };
        }

        if (!!v2) {
          return {
            id: coin.id,
            priceInETH: nonExponential(v2.priceInETH),
            tvlInETH: nonExponential(v2.tvlInETH),
          };
        }

        if (!!v3) {
          return {
            id: coin.id,
            priceInETH: nonExponential(v3.priceInETH),
            tvlInETH: nonExponential(v3.tvlInETH),
          };
        }

        return null;
      })
      .filter((d) => d !== null);
  }

  private async _fetchDestCoinsAnalyticV2(coins: IRawCoinInfo[]) {
    console.log(
      `Fetching dest coins analytic: ${JSON.stringify(
        coins.map((coin) => coin.id),
      )}`,
    );
    try {
      const { data } = await clientEthV2.query({
        query: FETCH_DEST_LIST_TOKENS_ANALYTIC_V2(),
        variables: {
          allTokens: coins.map((coin) => wrapperCoin2Ethereum(coin.id)),
        },
        fetchPolicy: 'no-cache',
      });

      if (
        !data ||
        !data.tokens ||
        !data.tokens.length ||
        !data.bundles ||
        !data.bundles.length
      ) {
        return [];
      }

      const dest = coins
        .map((coin) => {
          const analytic: IRawDestCoinAnalyticV2 = data.tokens.find(
            (c: IRawDestCoinAnalyticV2) =>
              c.id === wrapperCoin2Ethereum(coin.id),
          );
          if (!analytic) {
            return null;
          }

          return convertRaw2DestCoinAnalytic(
            coin,
            analytic,
            data.bundles[0].ethPrice,
          );
        })
        .filter((d) => d !== null);

      console.log(`Fetched dest coins analytic: ${JSON.stringify(dest)}`);
      return dest;
    } catch (err) {
      console.log('_fetchDestCoinsAnalyticV2::err', err);
      return [];
    }
  }

  private async _fetchDestCoinsAnalyticV3(coins: IRawCoinInfo[]) {
    console.log(
      `Fetching dest coins analytic: ${JSON.stringify(
        coins.map((coin) => coin.id),
      )}`,
    );
    try {
      const { data } = await clientEthV3.query({
        query: FETCH_DEST_LIST_TOKENS_ANALYTIC_V3(),
        variables: {
          allTokens: coins.map((coin) => wrapperCoin2Ethereum(coin.id)),
        },
        fetchPolicy: 'no-cache',
      });

      if (
        !data ||
        !data.tokens ||
        !data.tokens.length ||
        !data.bundles ||
        !data.bundles.length
      ) {
        return [];
      }

      const dest = coins
        .map((coin) => {
          const analytic: IRawDestCoinAnalyticV3 = data.tokens.find(
            (c: IRawDestCoinAnalyticV3) =>
              c.id === wrapperCoin2Ethereum(coin.id),
          );
          if (!analytic) {
            return null;
          }

          return convertRaw2DestCoinAnalytic(
            coin,
            {
              id: analytic.id,
              derivedETH: analytic.derivedETH,
              totalLiquidity: analytic.totalValueLocked,
            },
            data.bundles[0].ethPriceUSD,
          );
        })
        .filter((d) => d !== null);

      console.log(`Fetched dest coins analytic: ${JSON.stringify(dest)}`);
      return dest;
    } catch (err) {
      console.log('_fetchDestCoinsAnalyticV3:err', err);
      return [];
    }
  }
}
