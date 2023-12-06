import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HttpService } from '@nestjs/axios';
import { ethers } from 'ethers';
import { CoinsService } from 'src/modules/coins/coins.service';
import { CoinsDiffService } from 'src/modules/coins-diff/coins-diff.service';
import { sleep } from 'src/shares/helpers';
import { ADDRESS_ZERO } from 'src/shares/constants';
import { ESortingType } from 'src/shares/sorting';

const LIMIT_ITEM_PER_BATCH = 100;
const BASE_IMAGE_URL = 'https://api.pulsecoinlist.com/images';

export class Program {
  protected app: INestApplicationContext;
  private httpService: HttpService;
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
    this.httpService = this.app.get<HttpService>(HttpService);
    this.coinsService = this.app.get<CoinsService>(CoinsService);
    this.coinsDiffService = this.app.get<CoinsDiffService>(CoinsDiffService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');

    const totalCoins = await this.coinsService.count({});
    const totalBatches = Math.ceil(totalCoins / LIMIT_ITEM_PER_BATCH);
    const batches = Array.from(Array(totalBatches).keys());

    const startBatch = parseInt(process.env.START_BATCH, 10) || 0;
    for (const batch of batches) {
      if (batch < startBatch) {
        continue;
      }

      console.log(`Processing batch ${batch}...`);
      const coins = await this.coinsService.listCoins(
        {
          address: { $ne: ADDRESS_ZERO },
        },
        {
          page: batch,
          limit: LIMIT_ITEM_PER_BATCH,
        },
        {
          sortBy: 'createdAt',
          sortType: ESortingType.ASC,
        },
      );

      console.log(`Fetching total ${coins.docs.length} coins...`);
      for (const coin of coins.docs) {
        try {
          console.log(`Downloading logo for ${coin.address}...`);
          await this._downloadLogo(coin.address);
          await this.coinsService.saveLogo(
            coin.address.toLowerCase(),
            `${BASE_IMAGE_URL}/${coin.address.toLowerCase()}.png`,
          );
          await this.coinsDiffService.saveLogo(
            coin.address,
            `${BASE_IMAGE_URL}/${coin.address.toLowerCase()}.png`,
          );

          await sleep(1000);
        } catch (err) {
          console.log(`Not found logo for ${coin.address}, err=${err}`);
          fs.unlink(
            `${process.cwd()}/static/tmp/${coin.address.toLowerCase()}.png`,
            () => {},
          );
        }
      }
    }

    console.log('------------------COMPLETED------------------');
  }

  private async _downloadLogo(address: string): Promise<void> {
    const writer = fs.createWriteStream(
      `${process.cwd()}/static/tmp/${address.toLowerCase()}.png`,
    );

    const response = await this.httpService.axiosRef({
      url: `https://tokens.app.pulsex.com/images/tokens/${ethers.utils.getAddress(
        address,
      )}.png`,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
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
