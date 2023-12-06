import * as dotenv from 'dotenv';
dotenv.config();

import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createWriteStream } from 'fs';
import { SitemapAndIndexStream, SitemapStream } from 'sitemap';
import { AppModule } from 'src/app.module';
import { CoinsService } from 'src/modules/coins/coins.service';
import { sleep, slugify } from 'src/shares/helpers';
import { ESortingType } from 'src/shares/sorting';

const LIMIT_ITEM_PER_BATCH = 100;
const baseURL = 'https://pulsecoinlist.com';

export class Program {
  protected app: INestApplicationContext;
  private coinsService: CoinsService;

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
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');

    const writeStream = createWriteStream(`${process.cwd()}/outs/sitemap.xml`);
    const sitemap = new SitemapAndIndexStream({
      limit: 5000,
      getSitemapStream: (i) => {
        const sitemapStream = new SitemapStream({
          hostname: baseURL,
        });
        const path = `sitemap-${i}.xml`;
        return [
          new URL(path, `${baseURL}/sitemaps/`).toString(),
          sitemapStream,
          sitemapStream.pipe(
            createWriteStream(`${process.cwd()}/outs/sitemaps/${path}`),
          ),
        ];
      },
    });
    sitemap.pipe(writeStream, {
      end: false,
    });

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
        {},
        {
          page: batch,
          limit: LIMIT_ITEM_PER_BATCH,
        },
        {
          sortBy: 'createdAt',
          sortType: ESortingType.ASC,
        },
      );

      console.log(`Generating total ${coins.docs.length} coins...`);
      for (const coin of coins.docs) {
        sitemap.write({
          url: `${baseURL}/${slugify(coin.name)}/${slugify(coin.symbol)}/${
            coin.address
          }`,
        });
      }
    }

    await sleep(10000);
    sitemap.end();
    console.log('------------------COMPLETED------------------');

    return;
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
