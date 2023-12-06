import { BadRequestException } from '@nestjs/common';

export class GraphGetBlocksFailed extends BadRequestException {
  constructor() {
    super('Getting error when getting blocks');
  }
}

export class GraphGetBaseFeePerGasMetrics extends BadRequestException {
  constructor() {
    super('Getting error when getting base fee per gas metrics');
  }
}

export class GraphGetTotalPlsBurnedMetrics extends BadRequestException {
  constructor() {
    super('Getting error when getting total pls burned metrics');
  }
}

export class GraphGetLatestBlocksPlsBurnedMetrics extends BadRequestException {
  constructor() {
    super('Getting error when getting latest blocks pls burned metrics');
  }
}

export class GraphGetTopBlocksPlsBurnedMetrics extends BadRequestException {
  constructor() {
    super('Getting error when getting top blocks pls burned metrics');
  }
}

export class GraphFetchCoinsDetailFailed extends BadRequestException {
  constructor() {
    super('Getting error when fetching all coins detail');
  }
}

export class GraphFetchCoinsStatsFailed extends BadRequestException {
  constructor() {
    super('Getting error when fetching all coins stats');
  }
}

export class GraphFetchCoinsAnalyticFailed extends BadRequestException {
  constructor() {
    super('Getting error when fetching all coins analytic');
  }
}
