import { BadRequestException } from '@nestjs/common';

export class InvalidEthereumAddress extends BadRequestException {
  constructor() {
    super(`Incorrect PulseChain address.`);
  }
}
