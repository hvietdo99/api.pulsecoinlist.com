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
import * as moment from 'moment';
// import { HttpCacheInterceptor } from 'src/interceptors';
import {
  PaginationQuery,
  Pagination,
  IPagination,
} from 'src/shares/pagination';
import { ISorting, Sorting, SortingQuery } from 'src/shares/sorting';
import { CoinsService } from './coins.service';
import { ListCoinsQueryDto, VerifyCoinQueryDto } from './dto/coins.dto.query';
import {
  CoinResponseDto,
  ListCoinsResponseDto,
} from './dto/coins.dto.response';

@Controller('public/coins')
@ApiTags('public.coins')
// @UseInterceptors(HttpCacheInterceptor)
export class PublicCoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get()
  @ApiOperation({
    operationId: 'public.coins.list',
    summary: 'list coins',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ListCoinsResponseDto,
    description: '200-OK',
  })
  // @CacheTTL(300)
  @PaginationQuery()
  @SortingQuery()
  async listCoins(
    @Query() query: ListCoinsQueryDto,
    @Pagination() pagination: IPagination,
    @Sorting() sorting: ISorting,
  ): Promise<ListCoinsResponseDto> {
    let conditions: Record<string, any> = {};

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

    if (query.isRecentlyLaunched === 'true') {
      conditions = {
        ...conditions,
        createdAt: {
          $gte: moment().subtract('2', 'days').startOf('minute').toDate(),
        },
      };
    }

    if (query.isOutlierRemoved === 'true') {
      conditions = {
        ...conditions,
        volume7d: { $gte: 1000 },
        totalLiquidityUSD: { $gte: 1000 },
        marketCap: { $gte: 30000 },
      };
    }

    if (query.highlight) {
      switch (query.highlight) {
        case 'gainers':
        case 'losers':
          conditions = {
            ...conditions,
            volume24h: { $gte: 10000 },
            totalLiquidityUSD: { $gte: 25000 },
          };
          break;
        case 'listed24h':
          conditions = {
            ...conditions,
            volume24h: { $gte: 1000 },
            totalLiquidityUSD: { $gte: 1000 },
            createdAt: {
              $gte: moment().subtract('2', 'days').startOf('minute').toDate(),
            },
          };
        default:
          break;
      }
    }

    const results = await this.coinsService.listCoins(
      conditions,
      pagination,
      sorting,
    );
    return plainToInstance(ListCoinsResponseDto, results);
  }

  @Get('verify')
  @ApiOperation({
    operationId: 'public.coins.verify',
    summary: 'Verify coin info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => CoinResponseDto,
    description: '200-OK',
  })
  async verify(@Query() dto: VerifyCoinQueryDto): Promise<CoinResponseDto> {
    const resp = await this.coinsService.detailCoinBySlug(dto.slug);
    return plainToInstance(CoinResponseDto, resp);
  }
}
