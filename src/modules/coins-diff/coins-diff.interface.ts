export interface ICoinDiff {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isVerified?: boolean;
  priceInPLS: string;
  priceInETH: string;
  percentDiff?: number;
  tvlInPLS: string;
  tvlInETH: string;
  recommendEx: string;
}
