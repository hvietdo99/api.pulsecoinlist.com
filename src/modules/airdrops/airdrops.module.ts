import { CacheModule, Module } from '@nestjs/common';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { BlockchainsModule } from '../blockchain/blockchain.module';
import { CoinsModule } from '../coins/coins.module';
// import { PiteasTokensModule } from '../piteas-tokens/piteas-tokens.module';
import { PublicAirdropsController } from './airdrops.controller.public';
import { AirdropsService } from './airdrops.service';

@Module({
  imports: [
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      password: config.get<string>('redis.password'),
    }),
    BlockchainsModule,
    CoinsModule,
    // PiteasTokensModule,
  ],
  controllers: [PublicAirdropsController],
  providers: [AirdropsService],
  exports: [AirdropsService],
})
export class AirdropsModule {}
