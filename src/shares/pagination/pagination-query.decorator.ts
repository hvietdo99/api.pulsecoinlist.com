import { ApiQuery } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export const PaginationQuery = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number, default: 1',
      type: Number,
    }),

    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number items per page, default: 20',
      type: Number,
    }),
  );
};
