import { Module } from '@nestjs/common';
import { BlockchainsService } from './blockchain.service';

@Module({
  imports: [],
  providers: [BlockchainsService],
  exports: [BlockchainsService],
})
export class BlockchainsModule {}
