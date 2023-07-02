export interface IQueryOptions {
  where: any;
  relations?: any;
  limit?: number;
  page?: number;
  order?: any;
}
export interface ISelect {
  value: string | number;
  label: string;
}