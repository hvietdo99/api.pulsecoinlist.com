export interface ICoinMetadata {
  address: string;
  name: string;
  symbol: string;
  slug?: string;
  decimals: number;
  totalSupply?: string;
  isVerified?: boolean;
  isTop?: boolean;
}

export interface ICoinStats {
  rank?: number;
  address: string;
  price?: string;
  percent5m?: number;
  percent1h?: number;
  percent6h?: number;
  percent24h?: number;
  percent7d?: number;
  volume5m?: string;
  volume1h?: string;
  volume6h?: string;
  volume24h?: string;
  volume7d?: string;
  totalLiquidityUSD?: string;
  marketCap?: string;
  recommendEx: string;
}

export interface ICoinBuyAndSell {
  buy5m?: number;
  buy1h?: number;
  buy6h?: number;
  buy24h?: number;
  sell5m?: number;
  sell1h?: number;
  sell6h?: number;
  sell24h?: number;
}
