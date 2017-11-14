import * as React from 'react';
import classnames from 'classnames';

import './styles.css';
import { API_URL } from '../../constants';
import collectionOperationsSelect from '../../actions/collection/operations/select';

import { connect } from 'react-redux';
import moment from 'moment';

function formatTimestamp(isoTimestamp) {
  return moment.utc(isoTimestamp).local().format(`hh:mm:ss a`);
}

export function LinkDetailOperations({
  operations,
  links,

  onSelectOperation,
}) {
  if (operations.data.length) {
    return <div className="link-detail-operations">
      {operations.data.map(operation => {
        return <li
          key={operation.id}
          className={classnames('link-detail-operations-item', {
            selected: operations.selected === operation.id
          })}
        >
          <div
            className="link-detail-operations-item-header"
            onClick={() => onSelectOperation(operation.id)}
          >
            <div className="link-detail-operations-item-row">
              <span
                className={classnames('link-detail-operations-item-arrow', {
                  open: operations.selected === operation.id,
                })}
              >&#9654;</span>
              <span
                className={classnames(
                  'link-detail-operations-item-status',
                  `status-${operation.status.toLowerCase()}`
                )}
              >{operation.status}</span>
              <span className="link-detail-operations-item-id">{operation.id}</span>
            </div>
            <div className="link-detail-operations-item-row">
              <span className="link-detail-operations-item-duration">
                Started at {formatTimestamp(operation.startedAt)}&nbsp;
                (took {moment.utc(operation.finishedAt).valueOf() - moment.utc(operation.startedAt).valueOf()} ms)
              </span>
            </div>
          </div>
          {operations.selected === operation.id ? <div className="link-detail-operations-item-body">
            <ul>
              <li>Started At: {operation.startedAt}</li>
              <li>Finished At: {operation.finishedAt}</li>
              <li>Handled by worker {operation.handledBy}</li>
              <a href={`${API_URL}/v1/operations/${operation.id}`}>More detail</a>
            </ul>
            <pre style={{fontSize: 11}}>{JSON.stringify(operation, null, 2)}</pre>
          </div> : null}
        </li>;
      })}
    </div>;
  } else if (operations.loading) {
    return <div className="link-detail-operations link-detail-operations-loading">
      Loading operations...
    </div>;
  } else {
    return <div className="link-detail-operations link-detail-operations-empty">
      No operations found. Maybe no link is selected?
    </div>;
  }
}

export default connect(state => {
  return {
    operations: state.operations,
    links: state.links,
  };
}, dispatch => {
  return {
    onSelectOperation(id) {
      dispatch(collectionOperationsSelect(id));
    },
  };
})(LinkDetailOperations);
