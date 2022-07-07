import defaults from 'lodash/defaults';

import { LegacyForms, Select, CodeEditor } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { MyVariableQuery, defaultVariableQuery } from './types';

const { FormField } = LegacyForms;

interface VariableQueryProps {
  query: MyVariableQuery;
  onChange: (query: MyVariableQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {
  const currQuery = defaults(query, defaultVariableQuery);
  const [state, setState] = useState(currQuery);

  const saveQuery = () => {
    console.log('saveQuery')
    onChange(state, `xxx ${state.method}, ${state.url}, (${state.queryType})`);
  };

  // for param codeEditor setState callback
  useEffect(() => {
    console.log('useEffect')
    // onChange(state, `${state.url}(${state.url})`);
    onChange(state, `${state.requestBody}(${state.requestBody})`);
  }, [onChange, state]);

  // const handleChange = (event: React.FormEvent<HTMLInputElement>) =>
  //   setState({
  //     ...state,
  //     [event.currentTarget.name]: event.currentTarget.value,
  //   });

  const onMethodChange = (value: SelectableValue) => {
    setState({ ...state, method: value.value });
  };

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, url: event.target.value });
  };

  const onQueryTypeChange = (value: SelectableValue) => {
    setState({ ...state, queryType: value.value });
  };

  const onToEscapeFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, toEscapeFilter: event.target.value });
  };

  const onRequestBodyChange = (value: string) => {
    setState({ ...state, requestBody: value });
  };

  const onFieldsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, fields: event.target.value });
  };

  const selectOptions = [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }];
  const queryTypeOptions = [
    { label: 'Raw Fields', value: 'raw-fields' },
    { label: 'Terms Aggs', value: 'terms-aggs' },
  ];
  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label">Method</span>
        <Select options={selectOptions} value={selectOptions.filter(o => o.value === state.method)} onChange={onMethodChange} />
      </div>
      <div className="gf-form" style={{width:"100%"}}>
        <FormField labelWidth={8} inputWidth={500} value={state.url || ''} onBlur={saveQuery} onChange={onUrlChange} label="url" tooltip="Not used yet" />
      </div>
      <div className="gf-form">
        <FormField
          labelWidth={8}
          value={state.fields || ''}
          onBlur={saveQuery}
          onChange={onFieldsChange}
          label="Fields"
          tooltip="Enter fields to show as JSON format"
        />
      </div>
      <div className="gf-form-inline">
        <div className="gf-form">
          <span className="gf-form-label">Query Type</span>
          <Select options={queryTypeOptions} value={queryTypeOptions.filter(o => o.value === state.queryType)} onChange={onQueryTypeChange} />
        </div>
      </div>
      <div className="gf-form">
        <FormField labelWidth={8} value={state.toEscapeFilter || ''} onBlur={onToEscapeFilterChange} label="Escaping Filter" tooltip="Lucene filter to escape double quotes" />
      </div>
      <div className="gf-form">
        <span className="gf-form-label">Request Body</span>
        <div style={{width:"100%"}}>
          <CodeEditor 
            width="100%"
            height="200px"
            language='json' 
            showLineNumbers={true}
            value={state.requestBody || ''} 
            onBlur={onRequestBodyChange}>
          </CodeEditor>
        </div>
      </div>
    </>
  );
};
