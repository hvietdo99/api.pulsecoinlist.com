import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { BigNumber } from 'bignumber.js';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { GasNowService } from 'src/modules/gas-now/gas-now.service';
import { nonExponential } from 'src/shares/helpers';
import { BaseIntervalCrawler } from './base-interval.process';

const GAS_NOW_URL = 'https://beacon.pulsechain.com/api/v1/execution/gasnow';

@Injectable()
export class CollectGasNowProcess extends BaseIntervalCrawler {
  constructor(
    private readonly httpService: HttpService,
    private readonly gasNowService: GasNowService,
  ) {
    super(CollectGasNowProcess.name);
  }

  protected async prepare(): Promise<void> {
    this.setNextTickTimer(10000);
  }

  protected async doProcess(): Promise<void> {
    console.log('------------------PROCESSING------------------');

    try {
      const resp = await firstValueFrom(this.httpService.get(GAS_NOW_URL));
      if (!resp || !resp.data || !resp.data.data) {
        return;
      }

      const stats = resp.data.data;
      const dt = moment.utc(stats.timestamp);

      const timeFrames: moment.unitOfTime.StartOf[] = [
        'minutes',
        'hours',
        'days',
      ];

      const tasks = [60, 3600, 86400].map(async (resolution, idx) => {
        await this.gasNowService.save({
          resolution,
          timestamp: Math.ceil(dt.startOf(timeFrames[idx]).valueOf() / 1000),
          rapid: nonExponential(new BigNumber(stats.rapid)),
          fast: nonExponential(new BigNumber(stats.fast)),
          standard: nonExponential(new BigNumber(stats.standard)),
          slow: nonExponential(new BigNumber(stats.slow)),
        });
        return;
      });

      await Promise.all(tasks);

      console.log('------------------COMPLETED------------------');
      return;
    } catch (err) {
      console.log(`Fetch gas metric got an error: `, err);
      return;
    }
  }
}
