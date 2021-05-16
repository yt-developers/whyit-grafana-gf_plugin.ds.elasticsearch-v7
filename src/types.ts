import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
  description: string;
  method: string;
  url: string;
  queryType: string;
  toEscapeFilter?: string;
  requestBody?: string;
  fields: string;
  alias?: string;
  seriesAxisShowInterval?: number;
  seriesAxisSubstr?: string;
}

export const defaultQuery: Partial<MyQuery> = {
  method: 'GET',
  url: 'customer/_search',
  requestBody: '',
  fields: '[ { "text": "key", "text": "value" } ]',
  alias: 'Unknown',
  seriesAxisShowInterval: 1
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
