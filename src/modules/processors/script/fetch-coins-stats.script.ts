import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { FetchCoinsStatsProcess } from '../process/fetch-coins-stats.process';

class Program {
  private service: FetchCoinsStatsProcess;

  async main() {
    try {
      await this.initialize();
      await this.process();
    } catch (err) {
      console.error(err);
    }
  }

  private async initialize() {
    console.log('INIT');

    const app = await NestFactory.createApplicationContext(AppModule);
    this.service = app.get<FetchCoinsStatsProcess>(FetchCoinsStatsProcess);
  }

  private async process() {
    console.log('START:', new Date().toString());
    await this.service.start();
    console.log('DONE:', new Date().toString());
  }
}

new Program().main().catch((err) => {
  console.log(err);
  process.exit(err.code || -1);
});
