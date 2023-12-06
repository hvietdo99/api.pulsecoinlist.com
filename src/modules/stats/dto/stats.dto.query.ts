import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsIn, IsNotEmpty } from 'class-validator';

@Exclude()
export class StatsTimeframeQueryDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Timeframe',
    example: '15m',
  })
  @IsNotEmpty()
  @IsIn(['15m', '1h', '1d', '7d', '30d'])
  timeframe: string;
}
