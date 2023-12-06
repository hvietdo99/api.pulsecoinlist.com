import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { EDbModel } from 'src/shares/enums';
import { CoinSchema } from './coin.schema';
import { PublicCoinsController } from './coins.controller.public';
import { CoinsRepository } from './coins.repository';
import { CoinsService } from './coins.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EDbModel.COIN, collection: EDbModel.COIN, schema: CoinSchema },
    ]),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      password: config.get<string>('redis.password'),
    }),
  ],
  controllers: [PublicCoinsController],
  providers: [CoinsService, CoinsRepository],
  exports: [CoinsService],
})
export class CoinsModule {}
