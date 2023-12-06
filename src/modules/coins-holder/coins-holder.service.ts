import { Injectable } from '@nestjs/common';
import { ADDRESS_ZERO } from 'src/shares/constants';
import { CoinsHolderRepository } from './coins-holder.repository';
import { ICreateCoinHolder } from './coins-holder.interface';

@Injectable()
export class CoinsHolderService {
  constructor(private readonly repository: CoinsHolderRepository) {}

  async save(dto: ICreateCoinHolder) {
    await this.repository.save(dto);
  }

  async findManyByAddressesAndTimestamp(
    addresses: string[],
    timestamp: number,
    resolution: number = 60,
  ) {
    const results = await Promise.all(
      addresses.map((address) => {
        if (address === ADDRESS_ZERO) {
          return null;
        }

        return this.repository.findOneNearestByAddressAtTimestamp(
          address,
          timestamp,
          resolution,
        );
      }),
    );
    return results;
  }

  async reset() {
    await this.repository.reset();
    return;
  }
}
