import { IPagination } from '../pagination';
import { ESortingType, ISorting } from '../sorting';

export function parseQueryOptions(
  pagination?: IPagination,
  sorting?: ISorting,
): Record<string, any> {
  let options = {};
  if (pagination) {
    options = {
      ...options,
      ...pagination,
    };
  }

  if (sorting && sorting.sortBy) {
    options = {
      ...options,
      sort: {
        [sorting.sortBy]: sorting.sortType === ESortingType.DESC ? -1 : 1,
      },
    };
  } else {
    // default sort
    options = {
      ...options,
      sort: {
        createdAt: -1,
      },
    };
  }

  return options;
}
