export interface IRawCoinInfo {
  id: string;

  name: string;

  symbol: string;

  decimals: number;

  totalSupply?: string;

  isVerified?: boolean;

  recommendEx?: string;
}

export interface IRawCoinStats {
  id: string;

  derivedUSD: string;

  tradeVolumeUSD: string;

  totalLiquidity: string;
}

export interface IRawSourceCoinAnalytic {
  id: string;

  derivedPLS: string;

  totalLiquidity: string;
}

export interface IRawDestCoinAnalyticV2 {
  id: string;

  derivedETH: string;

  totalLiquidity: string;
}

export interface IRawDestCoinAnalyticV3 {
  id: string;

  derivedETH: string;

  totalValueLocked: string;
}
