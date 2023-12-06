import { CacheModule, Module } from '@nestjs/common';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { MongooseModule } from '@nestjs/mongoose';
import { EDbModel } from 'src/shares/enums';
import { CoinHolderSchema } from './coin-holder.schema';
import { CoinsHolderService } from './coins-holder.service';
import { CoinsHolderRepository } from './coins-holder.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EDbModel.COIN_HOLDER,
        collection: EDbModel.COIN_HOLDER,
        schema: CoinHolderSchema,
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
  providers: [CoinsHolderRepository, CoinsHolderService],
  exports: [CoinsHolderService],
})
export class CoinsHolderModule {}
