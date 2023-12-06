import { ADDRESS_ZERO, GRAPHQL_BATCH_LIMIT } from 'src/shares/constants';
import { ESortingType } from 'src/shares/sorting';
import { mergeCoinAnalytic, sleep } from 'src/shares/helpers';
import { CoinsDiffService } from '../coins-diff/coins-diff.service';
import { CoinsService } from '../coins/coins.service';
import { GraphQLService } from '../graphql/graphql.service';
import { CronProgram } from './crons.program';
import { VerifiedCoins } from '../coins/coins.constant';

class Program extends CronProgram {
  private graphQLService: GraphQLService;
  private coinsService: CoinsService;
  private coinsDiffService: CoinsDiffService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.graphQLService = this.app.get<GraphQLService>(GraphQLService);
    this.coinsService = this.app.get<CoinsService>(CoinsService);
    this.coinsDiffService = this.app.get<CoinsDiffService>(CoinsDiffService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');

    const totalCoins = await this.coinsService.count({});
    const totalBatches = Math.ceil(totalCoins / GRAPHQL_BATCH_LIMIT);
    const batches = Array.from(Array(totalBatches).keys());

    for (const batch of batches) {
      console.log(`Fetching all coins analytic, page=${batch}/${totalBatches}`);

      try {
        const coins = await this.coinsService.listCoins(
          {
            address: { $ne: ADDRESS_ZERO },
            volume7d: { $gt: 0 },
          },
          {
            page: batch + 1,
            limit: GRAPHQL_BATCH_LIMIT,
          },
          {
            sortBy: 'address',
            sortType: ESortingType.DESC,
          },
        );

        const infoCoins = coins.docs.map((coin) => {
          return {
            id: coin.address,
            name: coin.name,
            symbol: coin.symbol,
            decimals: coin.decimals,
            isVerified: VerifiedCoins.includes(coin.address),
            recommendEx: coin.recommendEx,
          };
        });

        const [sources, destinations] = await Promise.all([
          this.graphQLService.fetchSourceCoinsAnalytic(infoCoins),
          this.graphQLService.fetchDestCoinsAnalytic(infoCoins),
        ]);

        await Promise.all(
          infoCoins.map((coin) => {
            const merged = mergeCoinAnalytic(
              coin,
              sources.find((s) => s.id === coin.id),
              destinations.find((d) => d.id === coin.id),
            );
            if (!merged) {
              return;
            }

            return this.coinsDiffService.saveCoin(merged);
          }),
        );

        await sleep(2000);
      } catch (err) {
        console.error(`Could not fetch coins comparison with error`, err);
      }
    }

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
