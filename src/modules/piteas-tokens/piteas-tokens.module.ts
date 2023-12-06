import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { EDbModel } from 'src/shares/enums';
import { PiteasTokenSchema } from './piteas-token.schema';
import { PiteasTokensRepository } from './piteas-tokens.repository';
import { PiteasTokensService } from './piteas-tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EDbModel.PITEAS_TOKEN,
        collection: EDbModel.PITEAS_TOKEN,
        schema: PiteasTokenSchema,
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
  providers: [PiteasTokensRepository, PiteasTokensService],
  exports: [PiteasTokensService],
})
export class PiteasTokensModule {}
