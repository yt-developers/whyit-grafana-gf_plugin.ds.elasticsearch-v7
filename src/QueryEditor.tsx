import defaults from 'lodash/defaults';

import React, { PureComponent, ChangeEvent } from 'react';
import { LegacyForms, Select, CodeEditor } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, description: event.target.value });
  };

  onMethodChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    onChange({ ...query, method: value.value });
  };

  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, url: event.target.value });
  };

  onQueryTypeChange = (value: SelectableValue) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryType: value.value });
  };

  onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, alias: event.target.value });
  };

  onToEscapeFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, toEscapeFilter: event.target.value });
  };

  onSeriesAxisShowIntervalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, seriesAxisShowInterval: Number(event.target.value) });
  };

  onSeriesAxisSubstr = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, seriesAxisSubstr: event.target.value });
  };

  onRequestBodyChange = (value: string) => {
    const { onChange, query } = this.props;
    onChange({ ...query, requestBody: value });
  };

  onFieldsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, fields: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { description, method, url, queryType, toEscapeFilter, requestBody, fields, alias, seriesAxisShowInterval, seriesAxisSubstr } = query;

    const selectOptions = [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }];
    const queryTypeOptions = [
      { label: 'Normal', value: '' },
      { label: 'Table', value: 'table' },
      { label: 'Table Aggs 1 Bucket', value: 'table-aggs-1' },
      { label: 'Single Value Aggs', value: 'single-value-aggs' },   // for single value aggs, pipeline aggs(avg_bucket)
      { label: 'Date Histogram 1 Bucket', value: 'date-histogram-1' },
      { label: 'Date Histogram 2 Bucket', value: 'date-histogram-2' },
      { label: 'Series', value: 'series' },
      { label: 'Date Histogram to Series', value: 'date-series' },
    ];
    return (
      <div>
        <div className="gf-form">
          <FormField
            labelWidth={8}
            value={description || ''}
            onChange={this.onDescriptionChange}
            label="Description"
          />
        </div>
        <div className="gf-form">
          <span className="gf-form-label">Method</span>
          <Select options={selectOptions} value={selectOptions.filter(o => o.value === method)} onChange={this.onMethodChange} />
        </div>
        <div className="gf-form" style={{width:"100%"}}>
          <FormField labelWidth={8} inputWidth={500} value={url || ''} onChange={this.onUrlChange} label="url" tooltip="Not used yet" />
        </div>
        <div className="gf-form">
          <FormField
            labelWidth={8}
            value={fields || ''}
            onChange={this.onFieldsChange}
            label="Fields"
            tooltip="Enter fields to show as JSON format"
          />
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <span className="gf-form-label">Query Type</span>
            <Select options={queryTypeOptions} value={queryTypeOptions.filter(o => o.value === queryType)} onChange={this.onQueryTypeChange} />
          </div>
        </div>
        <div className="gf-form">
          <FormField labelWidth={8} value={alias || ''} onChange={this.onAliasChange} label="Alias" tooltip="For Legend" />
        </div>
        <div className="gf-form">
          <FormField labelWidth={8} value={toEscapeFilter || ''} onChange={this.onToEscapeFilterChange} label="Escaping Filter" tooltip="Lucene filter to escape double quotes" />
        </div>
        <div className="gf-form">
          <FormField labelWidth={16} value={seriesAxisShowInterval} onChange={this.onSeriesAxisShowIntervalChange} label="Show Interval" tooltip="" />
        </div>
        <div className="gf-form">
          <FormField labelWidth={16} value={seriesAxisSubstr || ''} onChange={this.onSeriesAxisSubstr} label="Series Axes Substring Format" tooltip="a,b in substring(a, b)" />
        </div>
        <div className="gf-form">
          <span className="gf-form-label">Request Body</span>
          <div style={{width:"100%"}}>
            <CodeEditor 
              width="100%"
              height="200px"
              language='json' 
              showLineNumbers={true}
              value={requestBody || ''} 
              onBlur={this.onRequestBodyChange}>
            </CodeEditor>
          </div>
        </div>
      </div>
    );
  }
}
