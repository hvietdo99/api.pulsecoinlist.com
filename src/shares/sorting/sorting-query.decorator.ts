import { ApiQuery } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ESortingType } from './sorting.enum';

export const SortingQuery = () => {
  return applyDecorators(
    ApiQuery({
      name: 'sortBy',
      required: false,
      description: 'Sort by field',
      type: String,
    }),

    ApiQuery({
      name: 'sortType',
      required: false,
      description: 'Sort type (asc, desc)',
      enum: ESortingType,
    }),
  );
};
