import { firstValueFrom } from 'rxjs';
import { CoinsService } from '../coins/coins.service';
import { CronProgram } from './crons.program';
import { HttpService } from '@nestjs/axios';
import { sleep } from 'src/shares/helpers';

const DEX_SCREENSER_API_URL =
  'https://api.dexscreener.com/latest/dex/pairs/pulsechain';

const PAIRS_MAPPING: Record<string, string[]> = {
  '0x0000000000000000000000000000000000000000': [
    // PLS
    '0xe56043671df55de5cdf8459710433c10324de0ae', // WPLS / DAI (v1)
    '0x6753560538eca67617a9ce605178f788be7e524e', // WPLS / USDC (v1)
    '0x146e1f1e060e5b5016db0d118d2c5a11a240ae32', // WPLS / DAI (v2)
    '0x8ebe62d5e9d26b637673d91f56900233d6a4910d', // WPLS / USDC (v2)
    '0x149b2c629e652f2e89e11cd57e5d4d77ee166f9f', // WPLS / PLSX (v2)
    '0x322df7921f28f1146cdf62afdac0d6bc0ab80711', // WPLS / USDT (v1)
  ],
  '0x95b303987a60c71504d99aa1b13b4da07b0790ab': [
    // PLSX
    '0x1b45b9148791d3a104184cd5dfe5ce57193a3ee9', // PLSX / WPLS (v1)
    '0xb2893cea8080bf43b7b60b589edaab5211d98f23', // PLSX / DAI (v1)
  ],
  '0x2fa878ab3f87cc1c9737fc071108f904c0b0c95d': [
    // INC
    '0xf808bb6265e9ca27002c0a04562bf50d4fe37eaa', // INC / WPLS (v1)
    '0x5b9661276708202dd1a0dd2346a3856b00d3c251', // INC / WPLS (v2)
    '0x7dbeca4c74d01cd8782d4ef5c05c0769723fb0ea', // INC / PLSX (v1)
    '0x4f0e991e170aa644763cb68ecc945bdf957473ee', // INC / DAI (v1)
  ],
  '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39': [
    // HEX
    '0xf1f4ee610b2babb05c635f726ef8b0c568c8dc65', // HEX / WPLS (v1)
    '0x19bb45a7270177e303dee6eaa6f5ad700812ba98', // HEX / WPLS (v2)
    '0x6f1747370b1cacb911ad6d4477b718633db328c8', // HEX / DAI (v1)
  ],
  '0x57fde0a71132198bbec939b98976993d8d89d225': [
    // eHEX
    '0xaa1ea17e7499f892ab9e45e139d843049942fb7a', // eHEX / WPLS (v1)
    '0xf0ea3efe42c11c8819948ec2d3179f4084863d3f', // eHEX / WPLS (v2)
    '0x1da059091d5fe9f2d3781e0fda238bb109fc6218', // eHEX / HEX (v1)
    '0x161b4a1e50031287a4677945de4c58f5b3e7a015', // eHEX / ATROPA (v1)
    '0x922723fc4de3122f7dc837e2cd2b82dce9da81d2', // eHEX / HEX (v2)
  ],
};

interface IPairTxn {
  buys: number;

  sells: number;
}

interface IPairResponse {
  pairAddress: string;

  txns: {
    m5: IPairTxn;

    h1: IPairTxn;

    h6: IPairTxn;

    h24: IPairTxn;
  };
}

class Program extends CronProgram {
  private httpService: HttpService;
  private coinsService: CoinsService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.httpService = this.app.get<HttpService>(HttpService);
    this.coinsService = this.app.get<CoinsService>(CoinsService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');
    for (const address of Object.keys(PAIRS_MAPPING)) {
      await this._retryCollect(address);
    }
    console.log('------------------COMPLETED------------------');
  }

  private async _retryCollect(coinAddress: string, retryCount?: number) {
    if (retryCount === 10) {
      return;
    }

    console.log(`Collecting ${coinAddress} buy & sell metrics...`);
    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `${DEX_SCREENSER_API_URL}/${PAIRS_MAPPING[coinAddress].join(',')}`,
        ),
      );
      if (
        !result ||
        !result.data ||
        !result.data.pairs ||
        !result.data.pairs.length
      ) {
        return this._retryCollect(coinAddress, retryCount++);
      }

      const pairs: IPairResponse[] = result.data.pairs;
      const totalBuy5m = pairs.reduce(
        (sum, pair) => sum + pair.txns.m5.buys,
        0,
      );
      console.log(`[${coinAddress}] totalBuy5m: ${totalBuy5m}`);
      const totalBuy1h = pairs.reduce(
        (sum, pair) => sum + pair.txns.h1.buys,
        0,
      );
      console.log(`[${coinAddress}] totalBuy1h: ${totalBuy1h}`);
      const totalBuy6h = pairs.reduce(
        (sum, pair) => sum + pair.txns.h6.buys,
        0,
      );
      console.log(`[${coinAddress}] totalBuy6h: ${totalBuy6h}`);
      const totalBuy24h = pairs.reduce(
        (sum, pair) => sum + pair.txns.h24.buys,
        0,
      );
      console.log(`[${coinAddress}] totalBuy24h: ${totalBuy24h}`);

      const totalSell5m = pairs.reduce(
        (sum, pair) => sum + pair.txns.m5.sells,
        0,
      );
      console.log(`[${coinAddress}] totalSell5m: ${totalSell5m}`);
      const totalSell1h = pairs.reduce(
        (sum, pair) => sum + pair.txns.h1.sells,
        0,
      );
      console.log(`[${coinAddress}] totalSell1h: ${totalSell1h}`);
      const totalSell6h = pairs.reduce(
        (sum, pair) => sum + pair.txns.h6.sells,
        0,
      );
      console.log(`[${coinAddress}] totalSell6h: ${totalSell6h}`);
      const totalSell24h = pairs.reduce(
        (sum, pair) => sum + pair.txns.h24.sells,
        0,
      );
      console.log(`[${coinAddress}] totalSell24h: ${totalSell24h}`);

      await this.coinsService.saveBuysAndSells(coinAddress, {
        buy5m: totalBuy5m,
        buy1h: totalBuy1h,
        buy6h: totalBuy6h,
        buy24h: totalBuy24h,
        sell5m: totalSell5m,
        sell1h: totalSell1h,
        sell6h: totalSell6h,
        sell24h: totalSell24h,
      });

      return;
    } catch (err) {
      console.log(
        `[${coinAddress}] Syncing native coin supply got an error: `,
        err,
      );
      await sleep(1000);

      return this._retryCollect(coinAddress, retryCount++);
    }
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
