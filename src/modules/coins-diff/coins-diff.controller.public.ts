import {
  // CacheTTL,
  Controller,
  Get,
  HttpStatus,
  Query,
  // UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
// import { HttpCacheInterceptor } from 'src/interceptors';
import {
  PaginationQuery,
  Pagination,
  IPagination,
} from 'src/shares/pagination';
import { ISorting, Sorting, SortingQuery } from 'src/shares/sorting';
import { CoinsDiffService } from './coins-diff.service';
import { ListCoinsDiffQueryDto } from './dto/coins-diff.dto.query';
import { ListCoinsDiffResponseDto } from './dto/coins-diff.dto.response';

@Controller('public/coins-diff')
@ApiTags('public.coins-diff')
// @UseInterceptors(HttpCacheInterceptor)
export class PublicCoinsDiffController {
  constructor(private readonly coinsDiffService: CoinsDiffService) {}

  @Get()
  @ApiOperation({
    operationId: 'public.coins-diff.list',
    summary: 'list coins diff',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ListCoinsDiffResponseDto,
    description: '200-OK',
  })
  // @CacheTTL(300)
  @PaginationQuery()
  @SortingQuery()
  async listCoinsDiff(
    @Query() query: ListCoinsDiffQueryDto,
    @Pagination() pagination: IPagination,
    @Sorting() sorting: ISorting,
  ): Promise<ListCoinsDiffResponseDto> {
    let conditions: Record<string, any> = {
      percentDiff: {
        $ne: null,
      },
    };

    if (query.searchKey) {
      conditions = {
        ...conditions,
        $or: [
          { address: { $regex: query.searchKey, $options: 'i' } },
          { name: { $regex: query.searchKey, $options: 'i' } },
          { symbol: { $regex: query.searchKey, $options: 'i' } },
        ],
      };
    }

    if (query.isVerified === 'true') {
      conditions = {
        ...conditions,
        isVerified: true,
      };
    }

    if (query.isWellEstablished === 'true') {
      conditions = {
        ...conditions,
        isWellEstablished: true,
      };
    }

    if (query.isOutlierRemoved === 'true') {
      conditions = {
        ...conditions,
        tvlInPLS: { $gte: 1000 },
        tvlInETH: { $gte: 1000 },
      };
    }

    const results = await this.coinsDiffService.listCoinsDiff(
      conditions,
      pagination,
      sorting,
    );
    return plainToInstance(ListCoinsDiffResponseDto, results);
  }
}
