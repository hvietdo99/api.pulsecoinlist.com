import { Injectable } from '@nestjs/common';
import { PiteasTokensRepository } from './piteas-tokens.repository';
import { ICreatePiteasToken } from './piteas-token.interface';

@Injectable()
export class PiteasTokensService {
  constructor(private readonly repository: PiteasTokensRepository) {}

  async createPiteasToken(dto: ICreatePiteasToken): Promise<void> {
    await this.repository.createPiteasToken(dto);
    return;
  }

  async listTokens() {
    const results = await this.repository.findAll();
    return results;
  }
}
