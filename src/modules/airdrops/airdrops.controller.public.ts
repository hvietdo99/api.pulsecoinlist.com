import {
  CacheTTL,
  Controller,
  Get,
  HttpStatus,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { HttpCacheInterceptor } from 'src/interceptors';
// import {
//   IPagination,
//   Pagination,
//   PaginationQuery,
// } from 'src/shares/pagination';
import { AirdropsService } from './airdrops.service';
import { ListAirdropsResponseDto } from './dto/airdrops.dto.response';

@Controller('public/airdrops')
@ApiTags('public.airdrops')
@UseInterceptors(HttpCacheInterceptor)
export class PublicAirdropsController {
  constructor(private readonly airdropsService: AirdropsService) {}

  @Get(':address/check')
  @ApiOperation({
    operationId: 'public.airdrops.check',
    summary: 'check coins airdrop',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ListAirdropsResponseDto,
    description: '200-OK',
  })
  @CacheTTL(300)
  // @PaginationQuery()
  async listAirdrops(
    @Param('address') address: string,
    // @Pagination() pagination: IPagination,
  ): Promise<ListAirdropsResponseDto> {
    const results = await this.airdropsService.listAirdrops(
      address,
      // pagination,
    );
    return plainToInstance(ListAirdropsResponseDto, results);
  }
}
