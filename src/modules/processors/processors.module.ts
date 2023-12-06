import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoinsSupplyModule } from '../coins-supply/coins-supply.module';
import { CoinsModule } from '../coins/coins.module';
import { GasModule } from '../gas-now/gas-now.module';
import { GraphQLModule } from '../graphql/graphql.module';
import { FetchCoinsStatsProcess } from './process/fetch-coins-stats.process';
import { CollectGasNowProcess } from './process/collect-gas-now.process';

@Module({
  imports: [
    HttpModule,
    GraphQLModule,
    CoinsModule,
    CoinsSupplyModule,
    GasModule,
  ],
  providers: [FetchCoinsStatsProcess, CollectGasNowProcess],
  exports: [FetchCoinsStatsProcess, CollectGasNowProcess],
})
export class ProcessorsModule {}
