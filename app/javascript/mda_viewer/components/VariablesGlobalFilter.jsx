import React from 'react';
import PropTypes from 'prop-types';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { useAsyncDebounce } from 'react-table';

function VariablesGlobalFilter({
  preGlobalFilteredRows,
  globalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const totalCount = preGlobalFilteredRows.length;
  const matchCount = globalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((val) => {
    setGlobalFilter(val || undefined);
  }, 200);

  let color = 'grey'; // inactive
  let active = 'true';
  if (value !== '') {
    color = '#007bff'; // active
    active = false;
  }
  return (
    <div className="input-group mb-3">
      <input
        id="filter"
        type="search"
        className="form-control"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Filter..."
      />
      <div className="input-group-append">
        <button
          diabled={!active}
          type="button"
          className="btn bg-transparent"
          style={{ marginLeft: '-40px', zIndex: 100, color }}
          onClick={() => {
            setValue('');
            onChange('');
          }}
        >
          <i className="fa fa-times" />
        </button>
        <span className="input-group-text padding-left">
          {matchCount}
          {' '}
          Variables
        </span>
      </div>
    </div>
  );
}

VariablesGlobalFilter.propTypes = {
  preGlobalFilteredRows: PropTypes.array.isRequired,
  globalFilteredRows: PropTypes.array.isRequired,
  globalFilter: PropTypes.string,
  setGlobalFilter: PropTypes.func.isRequired,
};

VariablesGlobalFilter.defaultProps = {
  globalFilter: '',
};

export default VariablesGlobalFilter;
