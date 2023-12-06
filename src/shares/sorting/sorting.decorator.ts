import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ESortingType } from './sorting.enum';
import { ISorting } from './sorting.interface';

export const createSorting = (
  sortBy: string,
  sortType: ESortingType,
): ISorting => {
  return {
    sortBy,
    sortType,
  };
};

export const Sorting = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return createSorting(req.query.sortBy, req.query.sortType);
  },
);
