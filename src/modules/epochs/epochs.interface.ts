export interface ICreateEpoch {
  epoch: number;

  totalValidators: number;

  averageBalance: number;

  issued: string;
}

export interface ICreateOrUpdateEpochStats {
  resolution: number;

  timestamp: number;

  issued: string;
}
