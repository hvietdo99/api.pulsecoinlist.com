import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { CoinResponseDto } from 'src/modules/coins/dto/coins.dto.response';
import { nonExponential, scaleDown, toBigNumOrZero } from 'src/shares/helpers';
import { PaginationResponseDto } from 'src/shares/pagination';

@Exclude()
class PriceMetricsResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin address',
    example: '0x...',
  })
  address: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin price',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  price: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Percent change in 1day',
    example: 1234,
  })
  percent24h: number;
}

@Exclude()
export class StatsSummaryResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total coins',
    example: 1234,
  })
  totalCoins: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total market cap',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  totalMarketCap: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total liquidity by usd',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  totalLiquidityUSD: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total volume in 24h',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  totalVolume24h: string;

  @Expose()
  @Type(() => PriceMetricsResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => PriceMetricsResponseDto,
    description: 'List coins price metrics',
  })
  topCoins: PriceMetricsResponseDto[];
}

@Exclude()
export class StatsHighlightResponseDto {
  @Expose()
  @Type(() => CoinResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => CoinResponseDto,
    description: 'Top gainers within 24h',
  })
  topGainers: CoinResponseDto[];

  @Expose()
  @Type(() => CoinResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => CoinResponseDto,
    description: 'Top losers within 24h',
  })
  topLosers: CoinResponseDto[];

  @Expose()
  @Type(() => CoinResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => CoinResponseDto,
    description: 'Top gainers within 7days',
  })
  listed24h: CoinResponseDto[];
}

@Exclude()
export class CoinMetricsResponseDto extends CoinResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Percent change in 5 mins',
    example: 0.05,
  })
  percent5m: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Percent change in 6 hours',
    example: 0.05,
  })
  percent6h: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total volume 5m by USD',
    example: '12345.0',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  volume5m: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total volume 1h by USD',
    example: '12345.0',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  volume1h: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total volume 6h by USD',
    example: '12345.0',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  volume6h: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total volume 7d by USD',
    example: '12345.0',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  volume7d: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total buy txn in 5 mins',
    example: 1,
  })
  buy5m: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total buy txn in 1 hour',
    example: 1,
  })
  buy1h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total buy txn in 6 hours',
    example: 1,
  })
  buy6h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total buy txn in 24 hours',
    example: 1,
  })
  buy24h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total sell txn in 5 mins',
    example: 1,
  })
  sell5m: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total sell txn in 1 hour',
    example: 1,
  })
  sell1h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total sell txn in 6 hours',
    example: 1,
  })
  sell6h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total sell txn in 24 hours',
    example: 1,
  })
  sell24h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total holders',
    example: 1,
  })
  holders: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Holder change in 5 mins',
    example: 1,
  })
  holder5m: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Holder change in 1 hours',
    example: 1,
  })
  holder1h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Holder change in 6 hours',
    example: 1,
  })
  holder6h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Holder change in 24 hours',
    example: 1,
  })
  holder24h: number;
}

@Exclude()
export class ListCoinMetricsResponseDto extends PaginationResponseDto {
  @Expose()
  @Type(() => CoinMetricsResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => CoinMetricsResponseDto,
    description: 'list of documents',
  })
  docs: CoinMetricsResponseDto[];
}

@Exclude()
export class SupplyValueResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Timestamp',
    example: 1691653020,
  })
  timestamp: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Supply value',
    example: '135243828998554.3',
  })
  @Transform(({ value }) =>
    nonExponential(scaleDown(toBigNumOrZero(value), 18)),
  )
  value: string;
}

@Exclude()
export class SupplyStatsResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Current supply',
    example: '135243828998554.3',
  })
  @Transform(({ value }) =>
    nonExponential(scaleDown(toBigNumOrZero(value), 18)),
  )
  current: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Supply change in resolution',
    example: '1234',
  })
  @Transform(({ value }) =>
    nonExponential(scaleDown(toBigNumOrZero(value), 18)),
  )
  changes: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Last synced timestamp',
    example: 1691653020,
  })
  lastSyncedAt: number;

  @Expose()
  @Type(() => SupplyValueResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => SupplyValueResponseDto,
    description: 'Supply values in chart',
  })
  charts: SupplyValueResponseDto[];
}

@Exclude()
export class BaseFeePerGasInMarketResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Last synced timestamp',
    example: 1691653020,
  })
  lastSyncedAt: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Average base fee per gas in range',
    example: 1723353459104955,
  })
  average: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Min base fee per gas in range',
    example: 1671857877983245,
  })
  min: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Block number of min base fee per gas in range',
    example: 17499109,
  })
  minBlockNumber: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Max base fee per gas in range',
    example: 1806984331968045,
  })
  max: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Block number of base fee per gas in range',
    example: 17499106,
  })
  maxBlockNumber: number;
}

@Exclude()
export class BaseFeePerGasInChartResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Timestamp',
    example: 1691653020,
  })
  timestamp: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Base fee in Wei',
    example: '1234',
  })
  value: number;
}

@Exclude()
export class BaseFeesPerGasStatsResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Last synced timestamp',
    example: 1691653020,
  })
  lastSyncedAt: number;

  @Expose()
  @Type(() => BaseFeePerGasInChartResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => BaseFeePerGasInChartResponseDto,
    description: 'Base fees over time in chart',
  })
  charts: BaseFeePerGasInChartResponseDto[];

  @Expose()
  @Type(() => BaseFeePerGasInMarketResponseDto)
  @ApiProperty({
    type: () => BaseFeePerGasInMarketResponseDto,
    description: 'Base fees per gas in market',
  })
  market: BaseFeePerGasInMarketResponseDto;
}

@Exclude()
export class ChartItemResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Timestamp',
    example: 1691653020,
  })
  timestamp: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total issued/burned PLS in Wei',
    example: '1234',
  })
  value: number;
}

@Exclude()
export class PlsIssuedStatsResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Last synced timestamp',
    example: 1691653020,
  })
  lastSyncedAt: number;

  @Expose()
  @Type(() => ChartItemResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => ChartItemResponseDto,
    description: 'Total PLS burned',
  })
  charts: ChartItemResponseDto[];
}

@Exclude()
export class PlsBurnedStatsResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Last synced timestamp',
    example: 1691653020,
  })
  lastSyncedAt: number;

  @Expose()
  @Type(() => ChartItemResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => ChartItemResponseDto,
    description: 'Total PLS burned',
  })
  charts: ChartItemResponseDto[];
}

@Exclude()
export class BlockResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Block number',
    example: 17541464,
  })
  blockNumber: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Block timestamp',
    example: 1691653020,
  })
  blockTimestamp: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Base fee per gas in block',
    example: '83000',
  })
  baseFeePerGas: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Pls burned in block',
    example: '83000',
  })
  burned: number;
}

@Exclude()
export class ListBlocksResponseDto {
  @Expose()
  @Type(() => BlockResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => BlockResponseDto,
    description: 'List blocks',
  })
  blocks: BlockResponseDto[];
}
