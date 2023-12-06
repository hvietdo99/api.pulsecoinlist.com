// import * as dotenv from 'dotenv';
// dotenv.config();

// import { INestApplicationContext } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from 'src/app.module';
// import { CoinsService } from 'src/modules/coins/coins.service';
// import { CoinsDiffService } from 'src/modules/coins-diff/coins-diff.service';
// import { CoinsSupplyService } from 'src/modules/coins-supply/coins-supply.service';

// export class Program {
//   protected app: INestApplicationContext;
//   private coinsService: CoinsService;
//   private coinsDiffService: CoinsDiffService;
//   private coinsSupplyService: CoinsSupplyService;

//   async main() {
//     try {
//       await this.initialize();
//       await this.process();
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   protected async initialize() {
//     this.app = await NestFactory.createApplicationContext(AppModule);
//     this.coinsService = this.app.get<CoinsService>(CoinsService);
//     this.coinsDiffService = this.app.get<CoinsDiffService>(CoinsDiffService);
//     this.coinsSupplyService =
//       this.app.get<CoinsSupplyService>(CoinsSupplyService);
//   }

//   protected async process(): Promise<void> {
//     console.log('------------------PROCESSING------------------');

//     await this.coinsService.reset();
//     await this.coinsDiffService.reset();
//     await this.coinsSupplyService.reset();

//     console.log('------------------COMPLETED------------------');
//   }
// }

// new Program()
//   .main()
//   .then(() => {
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.log(err);
//     process.exit(err.code || -1);
//   });
