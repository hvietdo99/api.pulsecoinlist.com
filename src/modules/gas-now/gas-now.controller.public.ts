import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { GasNowService } from './gas-now.service';
import {
  GasNowResponseDto,
  GasNowOverviewResponseDto,
} from './dto/gas-now.dto.response';

@Controller('public/gas-now')
@ApiTags('public.gas-now')
export class PublicGasController {
  constructor(private readonly service: GasNowService) {}

  @Get('latest')
  @ApiOperation({
    operationId: 'public.gas-now.latest',
    summary: 'Get latest gas record',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => GasNowResponseDto,
    description: '200-OK',
  })
  async latestGas() {
    const result = await this.service.getLatest();
    return plainToInstance(GasNowResponseDto, result);
  }

  @Get('overview')
  @ApiOperation({
    operationId: 'public.gas-now.overview',
    summary: 'Get gas overview stats',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => GasNowOverviewResponseDto,
    description: '200-OK',
  })
  async overview() {
    const result = await this.service.overview();
    return plainToInstance(GasNowOverviewResponseDto, result);
  }
}
