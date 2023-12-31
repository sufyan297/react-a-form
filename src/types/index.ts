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
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  number?: boolean;
  mime?: string;
  between?: string[];
  url?: boolean;
}

export interface IFile {
  file: File;
  name: string;
  url: string;
  type: string;
  hasPreview: boolean;
}