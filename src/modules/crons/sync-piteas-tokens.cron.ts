import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { sleep } from 'src/shares/helpers';
import { CronProgram } from './crons.program';
import { PiteasTokensService } from '../piteas-tokens/piteas-tokens.service';

class Program extends CronProgram {
  private httpService: HttpService;
  private piteasTokensService: PiteasTokensService;

  protected async initialize(): Promise<void> {
    await super.initialize();

    this.httpService = this.app.get<HttpService>(HttpService);
    this.piteasTokensService =
      this.app.get<PiteasTokensService>(PiteasTokensService);
  }

  protected async process(): Promise<void> {
    console.log('------------------PROCESSING------------------');
    await this._retrySync();
    console.log('------------------COMPLETED------------------');
  }

  private async _retrySync(retryCount: number = 0): Promise<void> {
    if (retryCount === 1) {
      return;
    }

    try {
      const result = await firstValueFrom(
        this.httpService.get(
          'https://raw.githubusercontent.com/piteasio/app-tokens/main/piteas-tokenlist.json',
        ),
      );
      if (!result || !result.data || !result.data.tokens) {
        return this._retrySync(!!retryCount ? retryCount++ : 1);
      }

      const tokens = result.data.tokens;
      await this.piteasTokensService.createPiteasToken(tokens);

      return;
    } catch (err) {
      console.log(`Syncing piteas tokens got an error: `, err);
      await sleep(1000);

      return this._retrySync(!!retryCount ? retryCount++ : 1);
    }
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
