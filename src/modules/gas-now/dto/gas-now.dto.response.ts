import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { nonExponential, toBigNumOrZero } from 'src/shares/helpers';

@Exclude()
export class GasNowResponseDto {
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
    description: 'Gas rapid',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  rapid: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Gas rapid',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  fast: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Gas rapid',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  standard: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Gas rapid',
    example: '1234',
  })
  @Transform(({ value }) => nonExponential(toBigNumOrZero(value)))
  slow: string;
}

@Exclude()
export class GasNowOverviewResponseDto {
  @Expose()
  @Type(() => GasNowResponseDto)
  @ApiProperty({
    type: () => GasNowResponseDto,
    description: 'Gas rapid',
  })
  current: GasNowResponseDto;

  @Expose()
  @Type(() => GasNowResponseDto)
  @ApiProperty({
    isArray: true,
    type: () => GasNowResponseDto,
    description: 'Gas now in chart',
  })
  charts: GasNowResponseDto[];
}
