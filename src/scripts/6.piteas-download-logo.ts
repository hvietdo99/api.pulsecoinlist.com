import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HttpService } from '@nestjs/axios';
import { CoinsService } from 'src/modules/coins/coins.service';
import { CoinsDiffService } from 'src/modules/coins-diff/coins-diff.service';
import { sleep } from 'src/shares/helpers';

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

    const resp = await this.httpService.axiosRef(
      'https://raw.githubusercontent.com/piteasio/app-tokens/main/piteas-tokenlist.json',
    );
    if (!resp || !resp.data || !resp.data.tokens) {
      return;
    }

    const tokens = resp.data.tokens;
    for (const token of tokens) {
      console.log(`Downloading logo for ${token.address}...`);
      await this._downloadLogo(token.address);

      await this.coinsService.saveLogo(
        token.address,
        `${BASE_IMAGE_URL}/${token.address.toLowerCase()}.png`,
      );
      await this.coinsDiffService.saveLogo(
        token.address,
        `${BASE_IMAGE_URL}/${token.address.toLowerCase()}.png`,
      );

      await sleep(1000);
    }

    console.log('------------------COMPLETED------------------');
  }

  private async _downloadLogo(address: string): Promise<void> {
    const writer = fs.createWriteStream(
      `${process.cwd()}/static/tmp/${address.toLowerCase()}.png`,
    );

    const response = await this.httpService.axiosRef({
      url: `https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/${address}.png`,
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
