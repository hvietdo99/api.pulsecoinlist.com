import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { nonExponential, toBigNumOrZero } from 'src/shares/helpers';
import { PaginationResponseDto } from 'src/shares/pagination';

@Exclude()
export class CoinDiffResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin address',
    example: '0x',
  })
  address: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin name',
    example: 'Hex',
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Coin symbol',
    example: 'HEX',
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
    type: Boolean,
    description: 'Is verified or not',
    example: true,
  })
  isVerified: boolean;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Price in PLS',
    example: '1.2376',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  priceInPLS: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Price in ETH',
    example: '1.2376',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  priceInETH: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Price diff between PLS & ETH',
    example: 1.2376,
  })
  percentDiff: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total locked value in PLS',
    example: '1.2376',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  tvlInPLS: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Total locked value in ETH',
    example: '1.2376',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  tvlInETH: string;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Recommend exchange (pulsexV1, pulsexV2)',
    example: 'pulsexV1',
  })
  recommendEx?: string;
}

@Exclude()
export class ListCoinsDiffResponseDto extends PaginationResponseDto {
  @Expose()
  @Type(() => CoinDiffResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => CoinDiffResponseDto,
    description: 'list of documents',
  })
  docs: CoinDiffResponseDto[];
}
