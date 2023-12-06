import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_LIMIT_MAXIMUM,
  PAGINATION_PAGE_DEFAULT,
} from './pagination.constants';

const createPagination = (
  page: number,
  limit: number,
): { page: number; limit: number } => {
  page = +page || PAGINATION_PAGE_DEFAULT;
  limit = +limit || PAGINATION_LIMIT_DEFAULT;

  if (limit > PAGINATION_LIMIT_MAXIMUM) {
    limit = PAGINATION_LIMIT_MAXIMUM;
  }

  return {
    page,
    limit,
  };
};

export const Pagination = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return createPagination(req.query.page, req.query.limit);
  },
);
