import { CacheModule, Module } from '@nestjs/common';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { MongooseModule } from '@nestjs/mongoose';
import { EDbModel } from 'src/shares/enums';
import { CoinSupplySchema } from './coin-supply.schema';
import { CoinsSupplyService } from './coins-supply.service';
import { CoinsSupplyRepository } from './coins-supply.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EDbModel.COIN_SUPPLY,
        collection: EDbModel.COIN_SUPPLY,
        schema: CoinSupplySchema,
      },
    ]),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      password: config.get<string>('redis.password'),
    }),
  ],
  controllers: [],
  providers: [CoinsSupplyRepository, CoinsSupplyService],
  exports: [CoinsSupplyService],
})
export class CoinsSupplyModule {}
