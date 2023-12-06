import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import {
  nonExponential,
  scaleUp,
  sleep,
  toBigNumOrZero,
} from 'src/shares/helpers';
import { EpochsService } from '../epochs/epochs.service';
import { CronProgram } from './crons.program';
import { ICreateEpoch } from '../epochs/epochs.interface';
import { BASE_REWARD_FACTOR } from '../epochs/epochs.constant';

const BEACON_API_URL = 'https://beacon.pulsechain.com';

class Program extends CronProgram {
  private httpService: HttpService;
  private epochsService: EpochsService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.httpService = this.app.get<HttpService>(HttpService);
    this.epochsService = this.app.get<EpochsService>(EpochsService);
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
        this.httpService.get(`${BEACON_API_URL}/index/data`),
      );
      if (!result || !result.data) {
        return this._retrySync(!!retryCount ? retryCount++ : 1);
      }

      const { active_validators, average_balance, current_epoch } = result.data;
      console.log('active_validators', active_validators);
      console.log(
        'average_balance',
        average_balance,
        (average_balance as string)
          .replace(new RegExp(',', 'g'), '')
          .replace('PLS', '')
          .trim(),
      );
      console.log('current_epoch', current_epoch);
      const latestEpoch = await this.epochsService.findLatestEpoch();
      if (
        !!latestEpoch &&
        toBigNumOrZero(latestEpoch.epoch).isEqualTo(current_epoch)
      ) {
        console.log(`${current_epoch} synced!`);
        return;
      }

      const stakedPls = toBigNumOrZero(
        (average_balance as string)
          .replace(new RegExp(',', 'g'), '')
          .replace('PLS', '')
          .trim(),
      );
      const issuedPlsPerEpoch = stakedPls
        .multipliedBy(BASE_REWARD_FACTOR)
        .multipliedBy(active_validators)
        .dividedBy(
          stakedPls.multipliedBy(1e9).multipliedBy(active_validators).sqrt(),
        );

      const dto: ICreateEpoch = {
        epoch: current_epoch,
        totalValidators: active_validators,
        averageBalance: stakedPls.toNumber(),
        issued: nonExponential(scaleUp(issuedPlsPerEpoch).decimalPlaces(0)),
      };

      await this.epochsService.createEpoch(dto);

      const now = moment().utc();
      const timeFrames: moment.unitOfTime.StartOf[] = [
        'minutes',
        'hours',
        'days',
      ];
      const tasks = [60, 3600, 86400].map(async (resolution, idx) => {
        await this.epochsService.createOrUpdateEpochStats({
          resolution,
          timestamp: Math.ceil(now.startOf(timeFrames[idx]).valueOf() / 1000),
          issued: nonExponential(scaleUp(issuedPlsPerEpoch).decimalPlaces(0)),
        });
        return;
      });
      await Promise.all(tasks);
      return;
    } catch (err) {
      console.log(`Syncing epoch got an error: `, err);
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
