import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { nonExponential, toBigNumOrZero } from 'src/shares/helpers';
import { PaginationResponseDto } from 'src/shares/pagination';

@Exclude()
export class AirdropResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin address',
    example: '0x0',
  })
  address: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin name',
    example: 'USD Coin',
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin symbol',
    example: 'USDC',
  })
  symbol: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Coin decimals',
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
    description: 'Price in PLS',
    example: '1.00',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  priceInPLS: string;

  // @Expose()
  // @ApiProperty({
  //   type: String,
  //   description: 'Price in ETH',
  //   example: '1.00',
  // })
  // @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  // priceInETH: string;

  // @Expose()
  // @ApiProperty({
  //   type: Number,
  //   description: 'Percent diff between PLS & ETH',
  //   example: 0.001,
  // })
  // percentDiff: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Percent change in 1day',
    example: 0.03,
  })
  percent24h: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin balance',
    example: '1.12345',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  balance: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Balance in USD',
    example: '1.12345',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  balanceInUSD: string;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Recommend exchange (pulsexV1, pulsexV2)',
    example: 'pulsexV1',
  })
  recommendEx?: string;
}

@Exclude()
export class ListAirdropsResponseDto extends PaginationResponseDto {
  @Expose()
  @Type(() => AirdropResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => AirdropResponseDto,
    description: 'list of documents',
  })
  docs: AirdropResponseDto[];
}
