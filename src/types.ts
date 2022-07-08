import { DataQuery, DataSourceJsonData, MetricFindValue } from '@grafana/data';

export interface MyQuery extends DataQuery {
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

export interface MyVariableQuery {
  method: string;
  url: string;
  queryType: string;
  toEscapeFilter?: string;
  requestBody?: string;
  fields: string;
  postScript?: string;
}

export const defaultVariableQuery: Partial<MyVariableQuery> = {
  method: 'GET',
  url: '/gf_proxy_name/_search',
  requestBody: '',
  fields: '[ { "value": "xxx", "name": "yyy" } ]',
  postScript: '',
};

export interface MyMetricFindValue extends MetricFindValue {
  value?: string;
}