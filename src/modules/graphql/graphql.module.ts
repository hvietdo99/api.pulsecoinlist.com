import { Module } from '@nestjs/common';
import { GraphQLService } from './graphql.service';
import { BlockchainsModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainsModule],
  controllers: [],
  providers: [GraphQLService],
  exports: [GraphQLService],
})
export class GraphQLModule {}
