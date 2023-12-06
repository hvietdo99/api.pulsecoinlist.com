import { sleep } from 'src/shares/helpers';

export abstract class BaseIntervalCrawler {
  protected _isStarted: boolean = false;

  protected _nextTickTimer: number = 1000;

  protected _processingTimeout: number = 300000;

  constructor(readonly serviceName: string) {}

  async start(): Promise<void> {
    if (this._isStarted) {
      console.warn(`Trying to start processor twice: ${this.constructor.name}`);
      return;
    }

    this._isStarted = true;

    try {
      await this.prepare();
      console.info(
        `${this.constructor.name} finished preparing. Will start the first tick shortly...`,
      );

      await this.onTick();
    } catch (err) {
      throw err;
    }
  }

  getNextTickTimer(): number {
    return this._nextTickTimer;
  }

  getProcessingTimeout(): number {
    return this._processingTimeout;
  }

  protected setNextTickTimer(timeout: number): void {
    this._nextTickTimer = timeout;
  }

  protected setProcessingTimeout(timeout: number): void {
    this._processingTimeout = timeout;
  }

  protected async onTick(): Promise<void> {
    const className = this.constructor.name;

    try {
      await this.doProcess();
    } catch (err) {
      console.error(
        `======================================================================================`,
      );
      console.error(err);
      console.error(
        `${className} something went wrong. The worker will be restarted shortly...`,
      );
      console.error(
        `======================================================================================`,
      );
    }

    await sleep(this.getNextTickTimer());
    await this.onTick();
  }

  // Should be override in derived classes
  // to setup connections, listeners, ... here
  protected abstract prepare(): Promise<void>;

  // Should be override in derived classes
  // Main logic will come to here
  protected abstract doProcess(): Promise<void>;
}
