import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { EDbModel } from 'src/shares/enums';
import { EpochSchema } from './epoch.schema';
import { EpochsRepository } from './epochs.repository';
import { EpochsService } from './epochs.service';
import { EpochStatsSchema } from './epoch-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EDbModel.EPOCH,
        collection: EDbModel.EPOCH,
        schema: EpochSchema,
      },
      {
        name: EDbModel.EPOCH_STATS,
        collection: EDbModel.EPOCH_STATS,
        schema: EpochStatsSchema,
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
  providers: [EpochsRepository, EpochsService],
  exports: [EpochsService],
})
export class EpochsModule {}
