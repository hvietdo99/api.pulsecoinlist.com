import { ESortingType } from './sorting.enum';

export interface ISorting {
  sortBy?: string;

  sortType?: ESortingType;
}
