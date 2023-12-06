import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaginationResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Total items of list',
  })
  totalDocs: number;

  @Expose()
  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Total number of pages.',
  })
  totalPages: number;

  @Expose()
  @ApiProperty({
    type: Number,
    example: 1,
    description: 'The current page number of the data list',
  })
  page: number;

  @Expose()
  @ApiProperty({
    type: Number,
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;
}
