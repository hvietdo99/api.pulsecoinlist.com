import * as dotenv from 'dotenv';
dotenv.config();

import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { CoinsService } from 'src/modules/coins/coins.service';
import { CoinsDiffService } from 'src/modules/coins-diff/coins-diff.service';
import { sleep } from 'src/shares/helpers';

import * as allTokens from './files/manual-tokens.json';

const BASE_IMAGE_URL = 'https://api.pulsecoinlist.com/images';

export class Program {
  protected app: INestApplicationContext;
  private coinsService: CoinsService;
  private coinsDiffService: CoinsDiffService;

  async main() {
    try {
      await this.initialize();
      await this.process();
    } catch (err) {
      console.error(err);
    }
  }

  protected async initialize() {
    this.app = await NestFactory.createApplicationContext(AppModule);
    this.coinsService = this.app.get<CoinsService>(CoinsService);
    this.coinsDiffService = this.app.get<CoinsDiffService>(CoinsDiffService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');

    for (const token of allTokens) {
      await this.coinsService.saveLogo(
        token.address.toLowerCase(),
        `${BASE_IMAGE_URL}/${token.logo}`,
      );
      await this.coinsDiffService.saveLogo(
        token.address,
        `${BASE_IMAGE_URL}/${token.logo}`,
      );

      await sleep(10);
    }

    console.log('------------------COMPLETED------------------');
  }
}

new Program()
  .main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(err.code || -1);
  });
