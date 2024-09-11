export interface PaginatedResult<T> {
  items: T[]
  meta: {
    page: number
    itemPerPage: number
    itemsCount: number
    pagesCount: number
  }
}
