import * as React from 'react';
import classnames from 'classnames';

import RefreshIcon from '../../images/Refresh Icon.png';

import Button from '../button/index';

import './styles.css';
import { API_URL } from '../../constants';

import collectionOperationsSelect from '../../actions/collection/operations/select';
import collectionLinksResync from '../../actions/collection/links/resync';
import collectionLinksRefresh from '../../actions/collection/links/refresh';

import { connect } from 'react-redux';
import moment from 'moment';
import TimeAgo from 'react-timeago';

function formatTimestamp(isoTimestamp) {
  return moment.utc(isoTimestamp).local().format(`hh:mm:ss a`);
}

export function LinkDetailOperations({
  operations,
  links,

  onSelectOperation,
  onResyncLink,
  onRefreshSync,
}) {
  const selectedLink = links.data.find(link => link.id === links.selected);

  // Header that is visible throughout all pages.
  const header = <div>
    <div className="link-detail-operations-header-row">
      Recent Link Operations
    </div>

    {selectedLink ? <div className="link-detail-operations-action-row">
      <Button
        className="link-detail-operations-resync"
        disabled={selectedLink.enabled === false}
        onClick={() => selectedLink.enabled ? onResyncLink(selectedLink) : null}
      >Resync</Button>
      <span className="link-detail-operations-last-synced-timestamp">
        Last synced: <TimeAgo date={selectedLink.lastSyncedAt} />
      </span>
      <img
        className="link-detail-operations-refresh-button"
        onClick={() => onRefreshSync(selectedLink.id)}
        src={RefreshIcon}
        alt="Refresh last synced time"
        title="Refresh last synced time"
      />
    </div> : null}

    {selectedLink && selectedLink.linkOperation === 'SENDING' ? <div
      className="link-detail-operations-resync-loading-row"
    >
      <span
        className="link-detail-operations-resync-loading-status-icon"
        role="img"
        aria-label="Loading"
      >&#8987;</span>
      Waiting for response from server...
    </div> : null}

    {selectedLink && selectedLink.linkOperation === 'TRIGGERED' ? <div
      className="link-detail-operations-resync-loading-row"
    >
      <span
        className="link-detail-operations-resync-loading-status-icon"
        role="img"
        aria-label="Waiting"
      >&#8987;</span>
      Waiting for webhook to run...
    </div> : null}
  </div>;

  if (operations.data.length) {
    return <div className="link-detail-operations">
      {header}

      {operations.data.sort((a, b) => { // Sort links from newest to oldest.
        return moment.utc(b.startedAt).unix() - moment.utc(a.startedAt).unix();
      }).map(operation => {
        return <li
          key={operation.id}
          className={classnames('link-detail-operations-item', {
            selected: operations.selected === operation.id
          })}
        >
          <div
            className="link-detail-operations-item-header"
            onClick={() => {
              if (operations.selected === operation.id) {
                // The item was already selected. Deselect it.
                return onSelectOperation(null);
              } else {
                return onSelectOperation(operation.id);
              }
            }}
          >
            <div className="link-detail-operations-item-row">
              <span
                className={classnames(
                  'link-detail-operations-item-status',
                  `status-${operation.status.toLowerCase()}`
                )}
              >
                {(function(operation) {
                  switch (operation.status) {
                  case 'SENDING':
                    return <span role="img" aria-label="Success">&#8987;</span>;
                  case 'TRIGGERED':
                    return <span role="img" aria-label="Triggered">&#8987;</span>;
                  case 'RUNNING':
                    return <span role="img" aria-label="Running">&#127939;</span>;
                  case 'OK':
                    return <span role="img" aria-label="Success">&#9989;</span>;
                  case 'ERROR':
                    return <span role="img" aria-label="Error">&#10060;</span>;
                  default:
                    return <span>?</span>;
                  }
                })(operation)}
              </span>
              <span className="link-detail-operations-item-id">{operation.id}</span>
              <span
                className={classnames('link-detail-operations-item-arrow', {
                  open: operations.selected === operation.id,
                })}
              >&#9654;</span>
            </div>
            <div className="link-detail-operations-item-row">
              <span className="link-detail-operations-item-duration">
                Started at {formatTimestamp(operation.startedAt)}&nbsp;
                {operation.finishedAt ? `(took ${moment.utc(operation.finishedAt).valueOf() - moment.utc(operation.startedAt).valueOf()} ms)` : null}
              </span>
            </div>
          </div>
          {operations.selected === operation.id ? <ul className="link-detail-operations-item-body">
            {operation.link && operation.link.upstreamLastSHA ? <li>
              <label htmlFor="link-detail-operations-item-body-item-handled-by">Proposed SHA update</label>
              <span
                className="link-detail-operations-item-body-item"
                id="link-detail-operations-item-body-item-handled-by"
                title={operation.link.upstreamLastSHA}
              >{operation.link.upstreamLastSHA.slice(0, 8)}</span>
            </li> : null}
            {operation.handledBy ? <li>
              <label htmlFor="link-detail-operations-item-body-item-handled-by">Handled By</label>
              <span
                className="link-detail-operations-item-body-item"
                id="link-detail-operations-item-body-item-handled-by"
                title={operation.handledBy}
              >{operation.handledBy.slice(0, 8)}...</span>
            </li> : null}
            <li>
              <label htmlFor="link-detail-operations-item-body-item-sync-type">Sync type</label>
              <span
                className="link-detail-operations-item-body-item"
                id="link-detail-operations-item-body-item-sync-type"
              >
                {(function(type) {
                  switch (type) {
                  case 'fork-all':
                    return 'All Forks';
                  case 'repo':
                    return 'Single Fork';
                  case 'unrelated-repo':
                    return 'Duplicate (out-of-network sync)';
                  default:
                    return type;
                  }
                })(operation.link.forkType)}
              </span>
            </li>

            {/* Syncing many forks */}
            {operation.output && operation.output.many === true ? <div>
              <li>
                <label htmlFor="link-detail-operations-item-body-item-number-of-forks">
                  Forks Synced
                </label>
                <span
                  className="link-detail-operations-item-body-item"
                  id="link-detail-operations-item-body-item-number-of-forks"
                >{operation.output.metrics.successes} successful / {operation.output.metrics.total} total</span>
              </li>

              {operation.output && operation.output.errors ? <li>
                <label htmlFor="link-detail-operations-item-body-item-errors">Sync Errors</label>
                {operation.output.errors.length === 0 ? <span
                  className="link-detail-operations-item-body-item"
                >None</span> : null}
                <ul
                  className="link-detail-operations-item-body-item"
                  id="link-detail-operations-item-body-item-errors"
                >
                  {operation.output.errors.map(err => {
                    return <li key={err.error} className="link-detail-operations-item-body-item-error-item">
                      {err.error}
                    </li>;
                  })}
                </ul>
              </li> : null}
            </div> : null}

            {/* Syncing a single fork */}
            {operation.output && operation.output.many === false ? <div>
              {operation.output && operation.output.forkCount ? <li>
                <label htmlFor="link-detail-operations-item-body-item">Number of forks</label>
                <span
                  className="link-detail-operations-item-body-item"
                  id="link-detail-operations-item-body-item"
                >{operation.output.forkCount}</span>
              </li> : null}
              {operation.output && operation.output.response ? <li>
                <label htmlFor="link-detail-operations-item-body-item">Response</label>
                <br/>
                <span
                  className="link-detail-operations-item-body-item"
                  id="link-detail-operations-item-body-item"
                >{operation.output.response}</span>
              </li> : null}
            </div> : null}
            <br/>
            <a href={`${API_URL}/v1/operations/${operation.id}`}>More detail</a>
          </ul> : null}
        </li>;
      })}
    </div>;
  } else if (operations.loading) {
    return <div className="link-detail-operations link-detail-operations-loading">
      Loading operations...
    </div>;
  } else if (selectedLink) {
    return <div className="link-detail-operations link-detail-operations-empty">
      {header}
      <div className="link-detail-operations-error">

        <svg
          width="200px"
          height="100px"
          viewBox="0 0 210 100"
          className="link-detail-operations-error-glyph"
        >
          <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="Artboard-3" transform="translate(-321.000000, -667.000000)">
              <g id="Group-5" transform="translate(320.000000, 667.000000)">
                <path d="M106,45.7572209 L106,16" id="Path-9" stroke="#FFFFFF" strokeWidth="2"></path>
                <path d="M106,45.7572209 L126.501614,45.7572209" id="Path-9-Copy" stroke="#DC6767" strokeWidth="3"></path>
                <circle id="Oval-6" stroke="#FFFFFF" strokeWidth="4" cx="106" cy="45" r="43"></circle>
                <circle id="Oval-6-Copy" fill="#FFFFFF" cx="106" cy="46" r="4"></circle>
              </g>
            </g>
          </g>
        </svg>

        No operations have been started in the past 24 hours.
      </div>
    </div>;
  } else {
    return null;
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
    onResyncLink(link) {
      dispatch(collectionLinksResync(link));
    },
    onRefreshSync(id) {
      dispatch(collectionLinksRefresh(id));
    },
  };
})(LinkDetailOperations);
