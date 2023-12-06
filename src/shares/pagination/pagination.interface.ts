export interface IPagination {
  page?: number;

  limit?: number;
}

export interface IPaginateModel<T> {
  totalDocs?: number;

  totalPages?: number;

  page?: number;

  limit?: number;

  docs?: T[];
}
