import BigNumber from 'bignumber.js';
import { COIN_WRAPPER_TO_ETHEREUM } from 'src/modules/coins-diff/coin-diff.constant';
import {
  IRawCoinInfo,
  IRawCoinStats,
  IRawDestCoinAnalyticV2,
  IRawSourceCoinAnalytic,
} from 'src/modules/graphql/graphql.interface';

export function toBigNumOrZero(value: string | number | BigNumber): BigNumber {
  if (value) {
    return new BigNumber(value);
  }
  return new BigNumber('0');
}

export function scaleDown(value: string | number | BigNumber, decimals = 18) {
  if (!value) {
    return new BigNumber(0);
  }

  return new BigNumber(value.toString()).dividedBy(
    new BigNumber(10).pow(decimals),
  );
}

export function scaleUp(
  value: string | number | BigNumber,
  decimals: number = 18,
): BigNumber {
  if (!value) {
    return new BigNumber(0);
  }

  return new BigNumber(value.toString()).multipliedBy(
    new BigNumber(10).pow(decimals),
  );
}

export function nonExponential(
  value: BigNumber,
  decimals: number = 18,
): string {
  if (!value || value.isNaN() || value.isZero()) {
    return '0';
  }

  let newValue = value.toFixed(decimals);
  if (newValue.indexOf('.') !== -1) {
    while (newValue.endsWith('0')) {
      newValue = newValue.substring(0, newValue.length - 1);
    }
    if (newValue.endsWith('.')) {
      newValue = newValue.substring(0, newValue.length - 1);
    }
  }
  return newValue;
}

export function convertRaw2CoinStats(
  coin: IRawCoinInfo,
  nowStats: IRawCoinStats,
  fiveMinutesAgo: IRawCoinStats,
  oneHourAgoStats: IRawCoinStats,
  sixHoursAgo: IRawCoinStats,
  oneDayAgoStats: IRawCoinStats,
  oneWeekAgoStats: IRawCoinStats,
) {
  if (!nowStats) {
    return null;
  }

  return {
    address: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    decimals: coin.decimals,
    price: new BigNumber(nowStats.derivedUSD),
    percent5m: !new BigNumber(fiveMinutesAgo?.derivedUSD || 0).isEqualTo(0)
      ? new BigNumber(nowStats.derivedUSD)
          .minus(fiveMinutesAgo.derivedUSD)
          .dividedBy(fiveMinutesAgo.derivedUSD)
      : new BigNumber(0),
    percent1h: !new BigNumber(oneHourAgoStats?.derivedUSD || 0).isEqualTo(0)
      ? new BigNumber(nowStats.derivedUSD)
          .minus(oneHourAgoStats.derivedUSD)
          .dividedBy(oneHourAgoStats.derivedUSD)
      : new BigNumber(0),
    percent6h: !new BigNumber(sixHoursAgo?.derivedUSD || 0).isEqualTo(0)
      ? new BigNumber(nowStats.derivedUSD)
          .minus(sixHoursAgo.derivedUSD)
          .dividedBy(sixHoursAgo.derivedUSD)
      : new BigNumber(0),
    percent24h: !new BigNumber(oneDayAgoStats?.derivedUSD || 0).isEqualTo(0)
      ? new BigNumber(nowStats.derivedUSD)
          .minus(oneDayAgoStats.derivedUSD)
          .dividedBy(oneDayAgoStats.derivedUSD)
      : new BigNumber(0),
    percent7d: !new BigNumber(oneWeekAgoStats?.derivedUSD || 0).isEqualTo(0)
      ? new BigNumber(nowStats.derivedUSD)
          .minus(oneWeekAgoStats.derivedUSD)
          .dividedBy(oneWeekAgoStats.derivedUSD)
      : new BigNumber(0),
    volume5m: new BigNumber(nowStats.tradeVolumeUSD).minus(
      fiveMinutesAgo?.tradeVolumeUSD || 0,
    ),
    volume1h: new BigNumber(nowStats.tradeVolumeUSD).minus(
      oneHourAgoStats?.tradeVolumeUSD || 0,
    ),
    volume6h: new BigNumber(nowStats.tradeVolumeUSD).minus(
      sixHoursAgo?.tradeVolumeUSD || 0,
    ),
    volume24h: new BigNumber(nowStats.tradeVolumeUSD).minus(
      oneDayAgoStats?.tradeVolumeUSD || 0,
    ),
    volume7d: new BigNumber(nowStats.tradeVolumeUSD).minus(
      oneWeekAgoStats?.tradeVolumeUSD || 0,
    ),
    totalLiquidityUSD: new BigNumber(nowStats.totalLiquidity).multipliedBy(
      nowStats.derivedUSD,
    ),
  };
}

export function convertRaw2SourceCoinAnalytic(
  coin: IRawCoinInfo,
  source: IRawSourceCoinAnalytic,
  plsPrice: string,
) {
  if (!source) {
    return null;
  }

  const priceInPLS = new BigNumber(source?.derivedPLS || 0).multipliedBy(
    plsPrice,
  );
  return {
    id: coin.id,
    priceInPLS,
    tvlInPLS: new BigNumber(source.totalLiquidity).multipliedBy(priceInPLS),
  };
}

export function convertRaw2DestCoinAnalytic(
  coin: IRawCoinInfo,
  dest: IRawDestCoinAnalyticV2,
  ethPrice: string,
) {
  if (!dest) {
    return null;
  }

  const priceInETH = new BigNumber(dest.derivedETH).multipliedBy(ethPrice);
  return {
    id: coin.id,
    priceInETH,
    tvlInETH: new BigNumber(dest.totalLiquidity).multipliedBy(priceInETH),
  };
}

export function mergeCoinAnalytic(
  coin: IRawCoinInfo,
  source: { priceInPLS: string; tvlInPLS: string },
  dest: { priceInETH: string; tvlInETH: string },
) {
  return {
    address: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    decimals: coin.decimals,
    isVerified: coin.isVerified,
    priceInPLS: source.priceInPLS,
    priceInETH: !!dest ? dest.priceInETH : null,
    percentDiff: !new BigNumber(dest?.priceInETH || 0).isEqualTo(0)
      ? new BigNumber(source.priceInPLS)
          .minus(dest.priceInETH)
          .dividedBy(dest.priceInETH)
          .decimalPlaces(4)
          .toNumber()
      : null,
    tvlInPLS: source.tvlInPLS,
    tvlInETH: !!dest ? dest.tvlInETH : null,
    recommendEx: coin.recommendEx,
  };
}

export function wrapperCoin2Ethereum(address: string) {
  return COIN_WRAPPER_TO_ETHEREUM[address] || address;
}
