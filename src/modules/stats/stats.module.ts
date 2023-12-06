import { CacheModule, Module } from '@nestjs/common';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { CoinsModule } from '../coins/coins.module';
import { CoinsHolderModule } from '../coins-holder/coins-holder.module';
import { CoinsSupplyModule } from '../coins-supply/coins-supply.module';
import { GasModule } from '../gas-now/gas-now.module';
import { GraphQLModule } from '../graphql/graphql.module';
import { PublicStatsController } from './stats.controller.public';
import { StatsService } from './stats.service';
import { EpochsModule } from '../epochs/epochs.module';

@Module({
  imports: [
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      password: config.get<string>('redis.password'),
    }),
    CoinsModule,
    CoinsHolderModule,
    CoinsSupplyModule,
    GasModule,
    GraphQLModule,
    EpochsModule,
  ],
  controllers: [PublicStatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
