import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { EDbModel } from 'src/shares/enums';
import { CoinDiffSchema } from './coin-diff.schema';
import { PublicCoinsDiffController } from './coins-diff.controller.public';
import { CoinsDiffRepository } from './coins-diff.repository';
import { CoinsDiffService } from './coins-diff.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EDbModel.COIN_DIFF,
        collection: EDbModel.COIN_DIFF,
        schema: CoinDiffSchema,
      },
    ]),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      password: config.get<string>('redis.password'),
    }),
  ],
  controllers: [PublicCoinsDiffController],
  providers: [CoinsDiffService, CoinsDiffRepository],
  exports: [CoinsDiffService],
})
export class CoinsDiffModule {}
