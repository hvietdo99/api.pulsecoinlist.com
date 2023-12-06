import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { GasNowRepository } from './gas-now.repository';
import { ICreateGasNow } from './gas-now.interface';

@Injectable()
export class GasNowService {
  constructor(private readonly repository: GasNowRepository) {}

  async save(dto: ICreateGasNow) {
    return this.repository.save(dto);
  }

  async getLatest() {
    const result = await this.repository.getLatest();
    if (!result) {
      return null;
    }

    return result;
  }

  async overview() {
    const nowTs = Math.ceil(moment().utc().startOf('minutes').valueOf() / 1000);
    const prevTs = Math.ceil(
      moment().utc().subtract('7', 'days').startOf('minutes').valueOf() / 1000,
    );

    const [latest, inRangeGas] = await Promise.all([
      this.repository.getLatest(),
      this.repository.getMultiInRange(prevTs, nowTs, 3600),
    ]);

    return {
      current: latest,
      charts: inRangeGas,
    };
  }

  async reset() {
    await this.repository.reset();
    return;
  }
}
