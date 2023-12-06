import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { sleep } from 'src/shares/helpers';
import { CronProgram } from './crons.program';
import { CoinsService } from '../coins/coins.service';
import { CoinsHolderService } from '../coins-holder/coins-holder.service';

const PULSECHAIN_SCAN_URL = 'https://scan.pulsechain.com';

const COIN_ADDRESSES = [
  '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d',
  '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  '0x57fde0a71132198BBeC939B98976993d8D89D225',
];

class Program extends CronProgram {
  private httpService: HttpService;
  private coinsService: CoinsService;
  private coinsHolderService: CoinsHolderService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.httpService = this.app.get<HttpService>(HttpService);
    this.coinsService = this.app.get<CoinsService>(CoinsService);
    this.coinsHolderService =
      this.app.get<CoinsHolderService>(CoinsHolderService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');
    for (const address of COIN_ADDRESSES) {
      await this._retrySync(address);
    }
    console.log('------------------COMPLETED------------------');
  }

  private async _retrySync(
    coinAddress: string,
    retryCount: number = 0,
  ): Promise<void> {
    if (retryCount === 1) {
      return;
    }

    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `${PULSECHAIN_SCAN_URL}/token-counters?id=${coinAddress}`,
        ),
      );
      if (!result || !result.data) {
        return this._retrySync(coinAddress, !!retryCount ? retryCount++ : 1);
      }

      const totalHolders: number = result.data.token_holder_count;
      if (!totalHolders) {
        return;
      }

      const now = moment().utc();
      await this.coinsService.saveHolders(coinAddress, totalHolders);

      const timeFrames: moment.unitOfTime.StartOf[] = [
        'minutes',
        'hours',
        'days',
      ];
      const tasks = [60, 3600, 86400].map(async (resolution, idx) => {
        await this.coinsHolderService.save({
          address: coinAddress,
          resolution,
          timestamp: Math.ceil(now.startOf(timeFrames[idx]).valueOf() / 1000),
          amount: totalHolders,
        });
        return;
      });

      await Promise.all(tasks);

      await sleep(5000);
      return;
    } catch (err) {
      console.log(
        `Syncing native coin supply got an error: ${err?.response?.data}`,
      );
      await sleep(1000);

      return this._retrySync(coinAddress, !!retryCount ? retryCount++ : 1);
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
