import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { EDbModel } from 'src/shares/enums';
import { GasNowSchema } from './gas-now.schema';
import { GasNowRepository } from './gas-now.repository';
import { GasNowService } from './gas-now.service';
import { PublicGasController } from './gas-now.controller.public';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EDbModel.GAS_NOW,
        collection: EDbModel.GAS_NOW,
        schema: GasNowSchema,
      },
    ]),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      password: config.get<string>('redis.password'),
    }),
  ],
  controllers: [PublicGasController],
  providers: [GasNowRepository, GasNowService],
  exports: [GasNowService],
})
export class GasModule {}
