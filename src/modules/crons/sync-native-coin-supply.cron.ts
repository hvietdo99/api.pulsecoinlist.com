import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { ADDRESS_ZERO } from 'src/shares/constants';
import { nonExponential, scaleUp, sleep } from 'src/shares/helpers';
import { CoinsSupplyService } from '../coins-supply/coins-supply.service';
import { CronProgram } from './crons.program';

const PULSECHAIN_SCAN_API_URL = 'https://scan.pulsechain.com/api';

class Program extends CronProgram {
  private httpService: HttpService;
  private coinsSupplyService: CoinsSupplyService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.httpService = this.app.get<HttpService>(HttpService);
    this.coinsSupplyService =
      this.app.get<CoinsSupplyService>(CoinsSupplyService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');
    await this._retrySync();
    console.log('------------------COMPLETED------------------');
  }

  private async _retrySync(retryCount: number = 0): Promise<void> {
    if (retryCount === 1) {
      return;
    }

    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `${PULSECHAIN_SCAN_API_URL}?module=stats&action=coinsupply`,
        ),
      );
      if (!result || !result.data) {
        return this._retrySync(!!retryCount ? retryCount++ : 1);
      }

      const now = moment().utc();

      const timeFrames: moment.unitOfTime.StartOf[] = [
        'minutes',
        'hours',
        'days',
      ];
      const tasks = [60, 3600, 86400].map(async (resolution, idx) => {
        await this.coinsSupplyService.save({
          address: ADDRESS_ZERO,
          totalSupply: nonExponential(scaleUp(result.data)),
          resolution,
          timestamp: Math.ceil(now.startOf(timeFrames[idx]).valueOf() / 1000),
        });
        return;
      });
      await Promise.all(tasks);

      return;
    } catch (err) {
      console.log(`Syncing native coin supply got an error: `, err);
      await sleep(1000);

      return this._retrySync(!!retryCount ? retryCount++ : 1);
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
