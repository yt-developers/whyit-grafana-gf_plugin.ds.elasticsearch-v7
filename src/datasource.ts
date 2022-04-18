// import defaults from 'lodash/defaults';

import { 
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings 
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions } from './types';
// import { MutableDataFrame, FieldType } from '@grafana/data';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;

  // constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: any, templateSrv: any) {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: any, private templateSrv: any) {
    super(instanceSettings);

    this.url = instanceSettings.url;
  }

  doRequest(query: any) {
    // options.withCredentials = this.withCredentials;
    // options.headers = this.headers;

    // return this.backendSrv.datasourceRequest(options);

    return this.backendSrv.datasourceRequest({
      // const result = await getBackendSrv().fetch<any>({
      method: query.method,
      // url: this.url + '/local_es/alert*/_search',
      url: this.url + query.url,
      // url: '/local_es/' + query.url,
      // url: 'http://192.168.43.46:9200',    // why is this simple es url is not working
      // params: query,
      // data: {
      //   size: 1
      // }
      data: query.method === 'POST' ? query.requestBody : null,
    });
  }

  query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    // const { range } = options;
    // const from = range.from.valueOf();
    // const to = range.to.valueOf();

    const promises = options.targets.map(query => {
      // query.requestBody = this.templateSrv.replace(query.requestBody);
      // this.templateSrv.replace(target.query, options.scopedVars, 'lucene')     // built-in es 참조용
      query.requestBody = this.templateSrv.replace(query.requestBody, options.scopedVars, 'lucene');
      // query.requestBody = this.templateSrv.replace(query.requestBody);
      // const regex = /org_id:.*\(.*\)/;
      if (query.toEscapeFilter) {
        const regex = new RegExp(query.toEscapeFilter + ':.*((.*))');
        const matches: any = (query.requestBody || '').match(regex);
        const filterQuery = matches[0].substring(0, matches[0].indexOf(')') + 1);
        const escapedQuery = filterQuery.replaceAll('"', '\\"');
        query.requestBody = (query.requestBody || '').replace(filterQuery, escapedQuery);
        // console.log(matches);
      }

      return new Promise((resolve, reject) => {
        this.doRequest(query).then((result: any) => {
          // console.log(result)
          if (query.queryType === 'table') {
            const columns: any[] = JSON.parse(query.fields);
            const columnNames: any[] = columns.map(o => Object.values(o)[0]);
            const rows: any = [];
            if (result.data.hits.hits) {
              const datas = result.data.hits.hits;
              datas.forEach((data: any) => {
                const src = data._source;
                const rowData = columnNames.map(c => src[c]);
                rows.push(rowData);
              });
            }
            const resultData = {
              type: 'table',
              columns: columns,
              rows: rows,
              refId: query.refId,
            };
            return resolve(resultData);
          } else if (query.queryType === 'table-aggs-doc-count') {
            const columns: any[] = JSON.parse(query.fields);
            const rows: any = [];
            if (result.data.aggregations) {
              const datas = result.data.aggregations;
              datas['1'].buckets.forEach((single: any) => {
                rows.push([single.key, single['doc_count']]);
              });
            }
            const resultData = {
              type: 'table',
              columns: columns,
              rows: rows,
              refId: query.refId,
            };
            return resolve(resultData);
          } else if (query.queryType === 'table-aggs-1') {
            const columns: any[] = JSON.parse(query.fields);
            const rows: any = [];
            if (result.data.aggregations) {
              const datas = result.data.aggregations;
              datas['2'].buckets.forEach((single: any) => {
                rows.push([single.key, single['1'].value]);
              });
            }
            const resultData = {
              type: 'table',
              columns: columns,
              rows: rows,
              refId: query.refId,
            };
            return resolve(resultData);
          } else if (query.queryType === 'single-value-aggs') {
            // no grafana built-in panels handle this result type
            let aggsResult = null;
            if (result.data.aggregations) {
              aggsResult = [result.data.aggregations['1'].value];
            }
            return resolve({
              type: 'table',
              columns: [{'text': query.alias}],   // use alias as key field
              rows: [aggsResult],
              refId: query.refId,
            });
          } else if (query.queryType === 'date-histogram-1') {
            let singleData = {};
            if (result.data.aggregations) {
              const datas = result.data.aggregations;
              const datapoints: any = [];
              datas['2'].buckets.forEach((single: any) => {
                datapoints.push([single['1'].value, single.key]);
              });
              singleData = {
                target: query.alias, // todo: extract to option
                datapoints: datapoints,
                refId: query.refId,
              };
            }
            return resolve(singleData);
          } else if (query.queryType === 'series') {
            // series data
            const seriesDatas: any = [];
            if (result.data.aggregations) {
              const datas = result.data.aggregations;
              datas['3'].buckets.forEach((single: any) => {
                const datapoints: any = [];
                single['2'].buckets.forEach((values: any) => {
                  datapoints.push([values['1'].value, values.key]);
                });
                const singleData = {
                  target: single.key,
                  datapoints: datapoints,
                };
                seriesDatas.push(singleData);
              });
            }
            return resolve({
              type: query.queryType,
              data: seriesDatas,
              refId: query.refId,
            });
          } else if (query.queryType === 'date-series') {
            // date-histogram to series by time-group
            const seriesDatas: any = [];
            if (result.data.aggregations) {
              const datas = result.data.aggregations;
              datas['2'].buckets.forEach((single: any, i: number) => {
                const datapoints = [[single['1'].value, single.key]];
                const singleData = {
                  target: function(key: string, axisInterval: number, keySubstrForm?: string) {
                    if (axisInterval > 0 && i % axisInterval == 0) {
                      if (keySubstrForm) {
                        const form = keySubstrForm.split(',')
                        return key.substring(Number(form[0]), Number(form[1]))
                      }
                      return key;
                    } else {
                      return ' '
                    }
                  }(single.key_as_string, query.seriesAxisShowInterval || 0, query.seriesAxisSubstr),
                  datapoints: datapoints,
                };
                seriesDatas.push(singleData);
              });
            }
            return resolve({
              type: query.queryType,
              data: seriesDatas,
              refId: query.refId,
            });
          }
        });
      });
    });
    return Promise.all(promises).then((data: any) => {
      let collectData: any = null;
      if (data[0] && data[0].type && (data[0].type === 'series' || data[0].type === 'date-series')) {
        collectData = {
          data: data[0].data, // data is come as array for multiple queries : hjchoi
        };
      } else {
        collectData = {
          data: data,
        };
      }
      // console.log(collectData);
      console.log('ds-es');
      return collectData;
    });
  }

  async testDatasource() {
    // Implement a health check for your data source.

    return {
      status: 'success',
      message: 'Success',
    }
  }
}
