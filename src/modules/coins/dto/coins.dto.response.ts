import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { nonExponential, scaleDown, toBigNumOrZero } from 'src/shares/helpers';
import { PaginationResponseDto } from 'src/shares/pagination';

@Exclude()
export class CoinResponseDto {
  @Expose()
  @ApiPropertyOptional({
    type: Number,
    description: 'Rank',
    example: 1,
  })
  rank?: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Address',
    example: '0x',
  })
  address: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Name',
    example: 'Hex',
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Symbol',
    example: 'HEX',
  })
  symbol: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Decimals',
    example: 18,
  })
  decimals: number;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Logo url',
    example: 'https://api.pulsecoinlist.com/images/0x0.png',
  })
  logo?: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total supply',
    example: '100000',
  })
  @Transform(({ obj, value }) =>
    nonExponential(scaleDown(toBigNumOrZero(value), obj.decimals)),
  )
  totalSupply: string;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: 'Is verified or not',
    example: true,
  })
  isVerified: boolean;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin price',
    example: '1.2376',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  price: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Percent change in 1hour',
    example: 0.05,
  })
  percent1h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Percent change in 1day',
    example: 0.03,
  })
  percent24h: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Percent change in 7days',
    example: -0.1,
  })
  percent7d: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total volume 24h by USD',
    example: '12345.0',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  volume24h: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total liquidity by USD',
    example: '123456789.012345',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  totalLiquidityUSD: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total liquidity by USD',
    example: '123456789.012345',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  marketCap: string;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Recommend exchange (pulsexV1, pulsexV2)',
    example: 'pulsexV1',
  })
  recommendEx?: string;
}

@Exclude()
export class ListCoinsResponseDto extends PaginationResponseDto {
  @Expose()
  @Type(() => CoinResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => CoinResponseDto,
    description: 'list of documents',
  })
  docs: CoinResponseDto[];
}
