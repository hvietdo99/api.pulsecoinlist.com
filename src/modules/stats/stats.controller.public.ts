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
import { StatsService } from './stats.service';
import {
  BaseFeesPerGasStatsResponseDto,
  ListBlocksResponseDto,
  ListCoinMetricsResponseDto,
  PlsBurnedStatsResponseDto,
  PlsIssuedStatsResponseDto,
  StatsHighlightResponseDto,
  StatsSummaryResponseDto,
  SupplyStatsResponseDto,
} from './dto/stats.dto.response';
import { StatsTimeframeQueryDto } from './dto/stats.dto.query';
// import { HttpCacheInterceptor } from 'src/interceptors';

@Controller('public/stats')
@ApiTags('public.stats')
// @UseInterceptors(HttpCacheInterceptor)
export class PublicStatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @ApiOperation({
    operationId: 'public.stats.summary',
    summary: 'summary',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => StatsSummaryResponseDto,
    description: '200-OK',
  })
  // @CacheTTL(300)
  async summary(): Promise<StatsSummaryResponseDto> {
    const result = await this.statsService.summary();
    return plainToInstance(StatsSummaryResponseDto, result);
  }

  @Get('highlight')
  @ApiOperation({
    operationId: 'public.stats.highlight',
    summary: 'highlight',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => StatsHighlightResponseDto,
    description: '200-OK',
  })
  // @CacheTTL(300)
  async highlight(): Promise<StatsHighlightResponseDto> {
    const result = await this.statsService.highlight();
    return plainToInstance(StatsHighlightResponseDto, result);
  }

  @Get('top-metrics')
  @ApiOperation({
    operationId: 'public.stats.top-metrics',
    summary: 'list coin top metrics',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ListCoinMetricsResponseDto,
    description: '200-OK',
  })
  // @CacheTTL(300)
  async topMetrics(): Promise<ListCoinMetricsResponseDto> {
    const results = await this.statsService.topCoinMetrics();
    return results as any;
  }

  @Get('pls-supply')
  @ApiOperation({
    operationId: 'public.stats.pls-supply',
    summary: 'Get PLS supply stats',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SupplyStatsResponseDto,
    description: '200-OK',
  })
  async supplyStats(@Query() dto: StatsTimeframeQueryDto) {
    const results = await this.statsService.supplyStats(dto);
    return plainToInstance(SupplyStatsResponseDto, results);
  }

  @Get('base-fee-per-gas-stats')
  @ApiOperation({
    operationId: 'public.stats.base-fee-per-gas-stats',
    summary: 'Get base fee per gas stats',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => BaseFeesPerGasStatsResponseDto,
    description: '200-OK',
  })
  async baseFeesOvertime(@Query() dto: StatsTimeframeQueryDto) {
    const results = await this.statsService.baseFeesPerGasStats(dto);
    return plainToInstance(BaseFeesPerGasStatsResponseDto, results);
  }

  @Get('pls-burned-stats')
  @ApiOperation({
    operationId: 'public.stats.pls-burned-stats',
    summary: 'Get total PLS burned in timeframe',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => PlsBurnedStatsResponseDto,
    description: '200-OK',
  })
  async plsBurnedStats(@Query() dto: StatsTimeframeQueryDto) {
    const results = await this.statsService.plsBurnedStats(dto);
    return plainToInstance(PlsBurnedStatsResponseDto, results);
  }

  @Get('latest-blocks-burned')
  @ApiOperation({
    operationId: 'public.stats.latest-blocks-burned',
    summary: 'Get latest blocks burned PLS in timeframe',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ListBlocksResponseDto,
    description: '200-OK',
  })
  async latestBlocksBurned() {
    const results = await this.statsService.latestBlocksBurned();
    return plainToInstance(ListBlocksResponseDto, results);
  }

  @Get('top-blocks-burned')
  @ApiOperation({
    operationId: 'public.stats.top-blocks-burned',
    summary: 'Get top blocks burned PLS in timeframe',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ListBlocksResponseDto,
    description: '200-OK',
  })
  async topBlocksBurned(@Query() dto: StatsTimeframeQueryDto) {
    const results = await this.statsService.topBlocksBurned(dto);
    return plainToInstance(ListBlocksResponseDto, results);
  }

  @Get('pls-issued-stats')
  @ApiOperation({
    operationId: 'public.stats.pls-issued-stats',
    summary: 'Get total PLS issued in timeframe',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => PlsIssuedStatsResponseDto,
    description: '200-OK',
  })
  async plsIssuedStats(@Query() dto: StatsTimeframeQueryDto) {
    const results = await this.statsService.plsIssuedStats(dto);
    return plainToInstance(PlsIssuedStatsResponseDto, results);
  }
}
