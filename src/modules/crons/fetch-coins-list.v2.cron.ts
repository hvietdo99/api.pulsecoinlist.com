import { GRAPHQL_BATCH_LIMIT } from 'src/shares/constants';
import { sleep, slugify } from 'src/shares/helpers';
import { CoinsService } from '../coins/coins.service';
import { GraphQLService } from '../graphql/graphql.service';
import { TopCoins, VerifiedCoins } from '../coins/coins.constant';
import { CronProgram } from './crons.program';

class Program extends CronProgram {
  private graphQLService: GraphQLService;
  private coinsService: CoinsService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.graphQLService = this.app.get<GraphQLService>(GraphQLService);
    this.coinsService = this.app.get<CoinsService>(CoinsService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');

    let page = 0;
    let isFetchedAll = false;

    do {
      console.log(`[V2] Fetching all coins detail, page=${page}`);

      const coins = await this.graphQLService.fetchCoinsDetailV2(
        GRAPHQL_BATCH_LIMIT,
        page * GRAPHQL_BATCH_LIMIT,
      );
      await Promise.all(
        coins.map((coin) =>
          this.coinsService.saveCoinMetadata({
            ...coin,
            address: coin.id,
            slug: slugify(`${coin.name} ${coin.symbol} ${coin.id}`),
            isVerified: VerifiedCoins.includes(coin.id),
            isTop: TopCoins.includes(coin.id),
          }),
        ),
      );

      await sleep(1000);

      if (!coins.length) {
        isFetchedAll = true;
      }

      page++;
    } while (!isFetchedAll);

    console.log('------------------COMPLETED------------------');
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
