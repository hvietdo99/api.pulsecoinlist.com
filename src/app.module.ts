import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as config from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AirdropsModule } from './modules/airdrops/airdrops.module';
import { CoinsDiffModule } from './modules/coins-diff/coins-diff.module';
import { CoinsModule } from './modules/coins/coins.module';
import { GraphQLModule } from './modules/graphql/graphql.module';
import { ProcessorsModule } from './modules/processors/processors.module';
import { StatsModule } from './modules/stats/stats.module';
import { CoinsSupplyModule } from './modules/coins-supply/coins-supply.module';
import { CoinsHolderModule } from './modules/coins-holder/coins-holder.module';
import { GasModule } from './modules/gas-now/gas-now.module';
import { EpochsModule } from './modules/epochs/epochs.module';
import { PiteasTokensModule } from './modules/piteas-tokens/piteas-tokens.module';
import { CrawlModule } from './modules/crawl/crawl.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      exclude: ['/api/(.*)'],
    }),
    MongooseModule.forRoot(config.get('mongodb.uri'), {
      autoIndex: config.get('mongodb.autoIndex'),
    }),
    HttpModule,
    GraphQLModule,
    CoinsModule,
    CoinsDiffModule,
    CoinsSupplyModule,
    CoinsHolderModule,
    AirdropsModule,
    ProcessorsModule,
    StatsModule,
    GasModule,
    EpochsModule,
    PiteasTokensModule,
    CrawlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply();
  }
}
