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
export interface IValidations {
  required?: boolean;
  min?: number;
  max?: number;
  email?: boolean;
  number?: boolean;
  mime?: string;
  between?: string[];
  url?: boolean;
}