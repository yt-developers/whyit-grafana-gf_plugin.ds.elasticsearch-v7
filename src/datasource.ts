// import defaults from 'lodash/defaults';

import { 
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MetricFindValue
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, MyVariableQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: any, private templateSrv: any) {
    super(instanceSettings);

    this.url = instanceSettings.url;
  }

  doRequest(query: any, scopedVars: any) {
    console.log('duRequest scopedVars >>>>>>>>>>>>>>>>>>>>>>>>>>>>>..');
    console.log(scopedVars);
    // options.withCredentials = this.withCredentials;
    // options.headers = this.headers;

    // return this.backendSrv.datasourceRequest(options);

    const templatedUrl = this.templateSrv.replace(query.url, scopedVars);

    let templatedReqBody = query.requestBody;
    if (query.toEscapeFilter && query.toEscapeFilter.trim().length > 0) {
      const toEscapeFilters: string[] = query.toEscapeFilter?.split(',') || [];
      toEscapeFilters.forEach(filter => {
        filter = filter.trim();
        const regex = new RegExp(filter + '.*\\:.*\\$' + filter);
        const matches: any = (templatedReqBody || '').match(regex);
        if (! matches)
          return;
        const matchStr = matches[0];
        const matchIndex = matches.index;
        const templatedStr = this.templateSrv.replace(matchStr, scopedVars, 'lucene');
        const escapedTemplatedStr = templatedStr.replaceAll('"', '\\"');
        templatedReqBody = templatedReqBody.substring(0, matchIndex) 
                         + escapedTemplatedStr
                         + templatedReqBody.substring(matchIndex + matchStr.length);
      })
    }
    templatedReqBody = this.templateSrv.replace(templatedReqBody, scopedVars);
    return this.backendSrv.datasourceRequest({
      // const result = await getBackendSrv().fetch<any>({
      method: query.method,
      // url: this.url + '/local_es/alert*/_search',
      url: this.url + templatedUrl,
      // url: '/local_es/' + query.url,
      // url: 'http://192.168.43.46:9200',    // why is this simple es url is not working
      // params: query,
      // data: {
      //   size: 1
      // }
      data: query.method === 'POST' ? templatedReqBody : null,
    });
  }

  query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    // const { range } = options;
    // const from = range.from.valueOf();
    // const to = range.to.valueOf();

    const promises = options.targets.map(query => {
      // query.requestBody = this.templateSrv.replace(query.requestBody);
      // this.templateSrv.replace(target.query, options.scopedVars, 'lucene')     // built-in es ?????????
      // query.requestBody = this.templateSrv.replace(query.requestBody, options.scopedVars, 'lucene');
      // // query.requestBody = this.templateSrv.replace(query.requestBody);
      // // const regex = /org_id:.*\(.*\)/;
      // const toEscapeFilters: string[] = query.toEscapeFilter?.split(',') || [];
      // toEscapeFilters.forEach(filter => {
      //   const regex = new RegExp(filter.trim() + ':.*((.*))');
      //   const matches: any = (query.requestBody || '').match(regex);
      //   if (! matches)
      //     return;
      //   const filterQuery = matches[0].substring(0, matches[0].indexOf(')') + 1);
      //   const escapedQuery = filterQuery.replaceAll('"', '\\"');
      //   query.requestBody = (query.requestBody || '').replace(filterQuery, escapedQuery);
      //   // console.log(matches);
      // })

      return new Promise((resolve, reject) => {
        this.doRequest(query, options.scopedVars).then((result: any) => {
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
          } else if (query.queryType === 'date-histogram-doc-count') {
            let singleData = {};
            if (result.data.aggregations) {
              const datas = result.data.aggregations;
              const datapoints: any = [];
              datas["1"].buckets.forEach((single: any) => {
                datapoints.push([single.doc_count, single.key]);
              });
              singleData = {
                target: query.alias, // todo: extract to option
                datapoints: datapoints,
                refId: query.refId,
              };
            }
            return resolve(singleData);
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

  metricFindQuery(query: MyVariableQuery, options?: any): Promise<MetricFindValue[]> {
    console.log('---------- metricFindQuery');
    console.log(query);
    console.log(options);
    return new Promise((resolve, reject) => {
      this.doRequest(query, options.scopedVars).then((result: any) => {
        if (query.postScript) {
          eval('(function(data) {' + query.postScript + '})(result)');
        }

        // let columns: any[] = [];
        const rows: any = [];
        if (query.queryType === 'raw-fields') {
          // { "value": "XXX" } : literal values
          // or 
          // { "value": "XXX", "name": "YYY" } : named values
          const fields: any = JSON.parse(query.fields);
          if (result.data.hits.hits) {
            const datas = result.data.hits.hits;
            datas.forEach((data: any) => {
              const src = data._source;
              if (fields.name) {
                rows.push({
                  text:  src[fields.name], 
                  value: src[fields.value]
                })
              } else {
                rows.push({
                  text:  src[fields.value]
                })
              }
            });
          }
        } else if (query.queryType === 'terms-aggs') {
          if (result.data.aggregations['1'].buckets) {
            const datas = result.data.aggregations['1'].buckets;
            datas.forEach((data: any) => {
              rows.push({
                text:  data.key
              })
            });
          }
        }
        console.log('rows =======');
        console.log(rows);
        return resolve(rows);
      });
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
