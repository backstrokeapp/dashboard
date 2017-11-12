import * as React from 'react';
import './styles.css';
import ColorHash from 'color-hash';
import lodashDebounce from 'lodash.debounce';
import classnames from 'classnames';
import mixpanel from 'mixpanel-browser';

import { connect } from 'react-redux';

import TimeAgo from 'react-timeago';

import Switch from '../toggle-switch/index';
import LinkError from '../link-error/index';
import Button from '../button/index';
import LinkDetailWebhook from '../link-detail-webhook/index';
import LinkDetailForkChoice, {
  ALL_FORKS_ICON,
  ONE_FORK_ICON,
  UNRELATED_ICON,
} from '../link-detail-fork-choice/index';

import collectionLinksEnable from '../../actions/collection/links/enable';
import collectionLinksSave from '../../actions/collection/links/save';
import collectionLinksDelete from '../../actions/collection/links/delete';
import collectionLinksResync from '../../actions/collection/links/resync';
import collectionLinksHideSyncStatus from '../../actions/collection/links/hide-sync-status';
import collectionLinksRefresh from '../../actions/collection/links/refresh';

import RefreshIcon from '../../images/Refresh Icon.png';

import { API_URL } from '../../constants';

// When testing, don't debounce. It makes assertions harder.
// FIXME: a bit of a hack. Other then timing, is there a way around this?
const debounce = process.env.NODE_ENV === 'test' ? a => a : lodashDebounce;

const ch = new ColorHash();
const githubMatchExpression = /https?:\/\/github\.com\//;

/**
 * Remove the `github.com`, if the user pasted a full GitHub link.
 * @param {string} url - a full GitHub link as https://github.com/backstrokeapp/dashboard
 * @return {string} - the fixed url if the GitHub url pattern is found, otherwise the original url
 */
function removeGithubPrefixFromRepositoryUrl(url) {
  if (url.search(githubMatchExpression) > -1) {
    url = url.replace(githubMatchExpression, "");
  }
  return url
}

function getDefaultBranch(branchList) {
  if (branchList.indexOf('master') !== -1) {
    return 'master';
  } else if (branchList.indexOf('trunk') !== -1) {
    return 'trunk';
  } else {
    return branchList[0];
  }
}

export class LinkDetail extends React.Component {
  constructor(props) {
    super(props);
    const link = this.props.initialLinkState;
    const linkName = (link && link.name) || '';

    // Construct initial state given the initial link as a template.
    this.state = {
      linkName,
      themeColor: ch.hex(linkName),
      upstreamError: null,
      forkError: null,

      upstreamOwner: (link && link.upstream && link.upstream.owner) || '',
      upstreamRepo: (link && link.upstream && link.upstream.repo) || '',
      upstreamBranch: (link && link.upstream && link.upstream.branch) || '',
      upstreamBranchList: (link && link.upstream && link.upstream.branches) || [],

      forkOwner: (link && link.fork && link.fork.owner) || '',
      forkRepo: (link && link.fork && link.fork.repo) || '',
      forkBranch: (link && link.fork && link.fork.branch) || '',
      forkBranchList: (link && link.fork && link.fork.branches) || [],
      forkType: (link && link.fork && link.fork.type) || 'fork-all',

      // Save the response from the api call made to get information about the fork.
      forkMeta: {},
    };

    // Fetch metadata for the fork on component load.
    this.fetchMeta('fork');

    // A debounced function to change the theme color. This is done so that changing the theme color
    // doesn't hapen on every keypress.
    this.updateThemeColor = debounce(function() {
      this.setState({
        themeColor: ch.hex(this.state.linkName),
      });
    }.bind(this), 1000);

    // Also debounce fetchMeta, so branches are only fetched when the user stops typing and not
    // after every keypress.
    this.fetchMeta = debounce(this.fetchMeta.bind(this), 250);
  }

  // Given a direction (ie, `fork` or `owner`), validate the owner/repo combo and update the
  // respective branches.
  fetchMeta(direction) {
    const owner = this.state[`${direction}Owner`],
          repo = this.state[`${direction}Repo`],
          branch = this.state[`${direction}Branch`];

    // Only run query when both an aowner and repo are defined.
    if (!owner || !repo) {
      return;
    }

    return fetch(`${API_URL}/v1/repos/github/${owner}/${repo}`, {
      credentials: 'include',
    }).then(resp => {
      if (owner.length && repo.length) {
        return resp.json();
      } else {
        return {valid: false};
      }
    }).then(body => {
      // If we checked the fork, save the response for validation later.
      if (direction === 'fork') {
        this.setState({forkMeta: body});
      }

      // Update the stored metadata on the state after the request is made.
      let error = null;
      if (direction === 'fork') {
        error = this.validateFork.call(this, body);
      }

      // Update the branch list if there are branches.
      if (body.valid) {
        this.setState({
          [`${direction}BranchList`]: body.branches,
          [`${direction}Error`]: error,
          [`${direction}Branch`]: branch ? branch : getDefaultBranch(body.branches),
        });
      } else {
        this.setState({
          [`${direction}BranchList`]: [],
          [`${direction}Error`]: `The repository ${owner}/${repo} was not found.`,
        });
      }
    });
  }

  // After the repository that a fork points to is updated, this function validates the fork and
  // throws any errors related to that fork. A couple cases in particular:
  // - The fork isn't actually a fork.
  // - The fork isn't a fork of the upstream.
  // - etc...
  validateFork(meta=this.state.forkMeta, forkType=this.state.forkType) {
    // When the user selects `All Forks`, there are no inputs, so it's always valid.
    if (forkType === 'fork-all') {
      return null;
    }

    // Ensure that the fork is actually a fork (unless the `unrelated-repo` choice is picked)
    if (meta.fork === false && forkType !== 'unrelated-repo') {
      return `Repo ${this.state.forkOwner}/${this.state.forkRepo} is not related to the upstream.`;
    }

    // Ensure that if a fork is selected, that it is a fork of the upstream and not just a random
    // other repo.
    if (
      meta.fork === true && 
      meta.parent.owner.toLowerCase() !== this.state.upstreamOwner.toLowerCase() &&
      meta.parent.name.toLowerCase() !== this.state.upstreamRepo.toLowerCase()
    ) {
      return `Repo ${this.state.forkOwner}/${this.state.forkRepo} is not a fork of ${this.state.upstreamOwner}/${this.state.upstreamRepo}.`;
    }

    // Ensure that the repo is not in the network if `unrelated-repo` is selected.
    if (meta.fork === true && forkType === 'unrelated-repo') {
      return `Repo ${this.state.forkOwner}/${this.state.forkRepo} is a fork of the upstream. Please sync to an out-of-network repository.`;
    }

    // The fork looks good!
    return null;
  }

  isLinkValid() {
    return this.state.linkName && this.state.linkName.length > 0 && (
      this.state.upstreamError === null && this.state.forkError === null
    ) && (
      // Upstream is valid?
      this.state.upstreamOwner && this.state.upstreamRepo && this.state.upstreamBranch
    ) && (
      // Fork is valid?
      (this.state.forkType === 'repo' && this.state.forkOwner && this.state.forkRepo && this.state.forkBranch)
      || (
        this.state.forkType === 'unrelated-repo' &&
        this.state.forkOwner && this.state.forkRepo && this.state.forkBranch
      )
      || this.state.forkType === 'fork-all'
    )
  }

  // Assemble a complete link using the updated elements in this component's state.
  makeLink() {
    return {
      ...this.props.initialLinkState,
      name: this.state.linkName,
      enabled: true,

      upstream: {
        ...this.props.initialLinkState.upstream,
        type: 'repo',
        owner: this.state.upstreamOwner,
        repo: this.state.upstreamRepo,
        branch: this.state.upstreamBranch,
        branches: this.state.upstreamBranchList,
      },

      fork: {
        ...this.props.initialLinkState.fork,
        type: this.state.forkType,
        owner: this.state.forkOwner,
        repo: this.state.forkRepo,
        branch: this.state.forkBranch,
        branches: this.state.forkBranchList,
      },
    }
  }

  render() {
    const link = this.props.initialLinkState;

    /* istanbul ignore next */
    process.env.REACT_APP_MIXPANEL_TOKEN && mixpanel.track('Rendered link detail page', {
      props: this.props,
      state: this.state,
    });

    if (!link) {
      /* istanbul ignore next */
      process.env.REACT_APP_MIXPANEL_TOKEN && mixpanel.track('Rendered empty link detail page', {
        props: this.props,
        state: this.state,
      });

      if (this.props.loading) {
        return <div className="link-detail-empty">
          Loading link...
        </div>;
      } else {
        return <div className="link-detail-empty">
          No such link was found.
        </div>;
      }
    }

    return <div>
      {/* report any errors */}
      <LinkError error={this.props.linkError} />

      <div
        className={classnames('link-detail', this.props.loading ? 'link-detail-loading' : null)}
        style={{backgroundColor: link.enabled ? this.state.themeColor : null}}
      >
        <textarea
          onChange={e => {
            this.setState({linkName: e.target.value});
            this.updateThemeColor();
          }}
          className="link-detail-title"
          placeholder="Link name"
          value={this.state.linkName}
        />
        <div className="link-detail-row">
          <Switch
            checked={link.enabled}
            onChange={() => this.props.onEnableLink(link)}
          />
          <Button
            className="link-detail-refresh"
            onClick={() => {
              const linkWasTriggeredButResponseIsPending = link.lastWebhookSync && link.lastWebhookSync.status !== 'TRIGGERED';
              const noWebhookSynced = !link.lastWebhookSync;

              if ((linkWasTriggeredButResponseIsPending || noWebhookSynced) && link.enabled) {
                this.props.onResyncLink(link)
              }
            }}
            disabled={link.enabled === false || (link.lastWebhookSync && link.lastWebhookSync.status === 'TRIGGERED')}
          >{link.lastWebhookSync && link.lastWebhookSync.status === 'TRIGGERED' ? 'Waiting...' : 'Resync'}</Button>
        </div>

        {link.enabled && link.lastSyncedAt ?
          <div className="link-detail-row link-detail-last-sync-time">
            <span>Last synced: <TimeAgo date={ link.lastSyncedAt } /></span>
            <img
              className="link-detail-refresh-button"
              onClick={() => this.props.onRefreshSync(link.id)}
              src={RefreshIcon}
              alt="Refresh last synced time"
              title="Refresh last synced time"
            />
          </div> : null
        }

        {/* If a syncing operation is going on, show the status info in the view */}
        {link.lastWebhookSync ? <div className="link-detail-sync-status">
          <div
            className="link-detail-sync-status-close"
            onClick={() => this.props.onHideLinkSyncStatus(link)}
          >&times;</div>

          {(function(link) {
            switch (link.lastWebhookSync.status) {
            case 'SENDING':
              return <span>
                <span className="link-detail-sync-status-icon" role="img" aria-label="Success">&#8987;</span>
                Waiting for response from server...
              </span>;
            case 'TRIGGERED':
              return <span>
                <span className="link-detail-sync-status-icon" role="img" aria-label="Success">&#8987;</span>
                Waiting for webhook to run...
              </span>;
            case 'RUNNING':
              return <span>
                <span className="link-detail-sync-status-icon" role="img" aria-label="Success">&#127939;</span>
                Running link on worker...
              </span>;
            case 'OK':
              return <div>
                <div>
                  <span className="link-detail-sync-status-icon" role="img" aria-label="Success">&#9989;</span>
                  Sync successful.
                </div>
                {link.lastWebhookSync.output.response ? <div>
                  {link.lastWebhookSync.output.response}
                </div>: null}
                <div>Started at: <span>{link.lastWebhookSync.startedAt}</span></div>
                <div>Finished at: {link.lastWebhookSync.finishedAt}</div>
              </div>;
            case 'ERROR':
              return <div>
                <div>
                  <span className="link-detail-sync-status-icon" role="img" aria-label="Success">&#10060;</span>
                  Error in syncing link.
                </div>
                <div>{link.lastWebhookSync.output.error}</div>
              </div>;
            default:
              return <span>Unknown status {link.lastWebhookSync.status}</span>
            }
          })(link)}
        </div> : null}

        <div className="link-detail-repository to">
          <div className="link-detail-repository-header">
            <span className="link-detail-repository-header-title">Repository</span>
            {this.state.upstreamError ? <span
              className="link-detail-repository-header-error"
            >{this.state.upstreamError}</span> : null}
          </div>
          <div className="link-detail-repository-edit">
            <div className="link-detail-repository-edit-row-owner-name">
              <input
                className="link-detail-box owner"
                placeholder="username"
                value={this.state.upstreamOwner}
                onChange={e => {
                  e.target.value = removeGithubPrefixFromRepositoryUrl(e.target.value);
                  // If a string like "abc/def" is pasted into the textbox, then properly split it
                  // into the two boxes.
                  if (e.target.value.indexOf('/') !== -1) {
                    const parts = e.target.value.split('/');
                    this.setState({
                      upstreamOwner: parts[0],
                      upstreamRepo: parts[1],
                    });
                    this.fetchMeta('upstream');
                  } else {
                    this.setState({upstreamOwner: e.target.value})
                    this.fetchMeta('upstream');
                  }
                }}
                onKeyDown={e => {
                  // Skip to repo box when slash is pressed.
                  if (e.key === '/') {
                    this.upstreamRepoBox.focus()
                    e.preventDefault();
                  }
                }}
              />
              <span className="link-detail-decorator">/</span>
              <input
                className="link-detail-box repo"
                placeholder="repository"
                ref={ref => this.upstreamRepoBox = ref}
                value={this.state.upstreamRepo}
                onChange={e => {
                  this.setState({upstreamRepo: e.target.value})
                  this.fetchMeta('upstream');
                }}
              />
            </div>
            <div className="link-detail-repository-edit-row-three">
              <select
                className="link-detail-box branch"
                onChange={e => this.setState({upstreamBranch: e.target.value})}
                value={this.state.upstreamBranch}
              >
                {this.state.upstreamBranchList.map(branch => <option key={branch}>{branch}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="link-detail-repository from">
          <div className="link-detail-repository-header">
            <span className="link-detail-repository-header-title">Sync Type</span>
          </div>
          <div className="link-detail-repository-edit">
            <div className="link-detail-repository-edit-row-fork-choices">
              <LinkDetailForkChoice
                icon={ALL_FORKS_ICON}
                label="All Forks"
                active={this.state.forkType === 'fork-all'}
                onClick={() => {
                  this.setState({
                    forkType: 'fork-all',
                    forkError: this.validateFork.call(this, this.state.forkMeta, 'fork-all'),
                  }, () => {
                    this.fetchMeta.call(this, 'fork')
                  });
                }}
              />
              <LinkDetailForkChoice
                icon={ONE_FORK_ICON}
                label="One Fork"
                active={this.state.forkType === 'repo'}
                onClick={() => {
                  this.setState({
                    forkType: 'repo',
                    forkError: this.validateFork.call(this, this.state.forkMeta, 'repo'),
                  }, () => this.fetchMeta.call(this, 'fork'));
                }}
              />
              <LinkDetailForkChoice
                icon={UNRELATED_ICON}
                label="Duplicate"
                active={this.state.forkType === 'unrelated-repo'}
                onClick={() => {
                  this.setState({
                    forkType: 'unrelated-repo',
                    forkError: this.validateFork.call(this, this.state.forkMeta, 'unrelated-repo'),
                  }, () => this.fetchMeta.call(this, 'fork'));
                }}
              />
            </div>

            {this.state.forkError ? <div className="link-detail-repository-header-error">
              {this.state.forkError}
            </div> : null}

            {this.state.forkType === 'repo' || this.state.forkType === 'unrelated-repo' ? <div
              className="link-detail-repository-edit-row"
            >
              <div className="link-detail-repository-edit-row-owner-name">
                <input
                  className="link-detail-box owner"
                  placeholder="username"
                  value={this.state.forkOwner}
                  onChange={e => {
                    e.target.value = removeGithubPrefixFromRepositoryUrl(e.target.value);
                    // If a string like "abc/def" is pasted into the textbox, then properly split it
                    // into the two boxes.
                    if (e.target.value.indexOf('/') !== -1) {
                      const parts = e.target.value.split('/');
                      this.setState({
                        forkOwner: parts[0],
                        forkRepo: parts[1],
                      });
                      this.fetchMeta('fork');
                    } else {
                      this.setState({forkOwner: e.target.value}, () => {
                        this.fetchMeta('fork');
                      });
                    }
                  }}
                  onKeyDown={e => {
                    // Skip to repo box when slash is pressed.
                    if (e.key === '/') {
                      this.forkRepoBox.focus()
                      e.preventDefault();
                    }
                  }}
                />
                <span className="link-detail-decorator">/</span>
                <input
                  className="link-detail-box repo"
                  placeholder="repository"
                  value={this.state.forkRepo}
                  ref={ref => this.forkRepoBox = ref}
                  onChange={e => {
                    this.setState({forkRepo: e.target.value}, () =>
                      this.fetchMeta('fork'));
                  }}
                />
              </div>
              <div className="link-detail-repository-edit-row-three">
                <select
                  className="link-detail-box branch"
                  value={this.state.forkBranch}
                  onChange={e => this.setState({forkBranch: e.target.value})}
                >
                  {this.state.forkBranchList.map(branch => <option key={branch}>{branch}</option>)}
                </select>
              </div>
            </div> : null}
          </div>
        </div>

        <div className="link-detail-save-button-container">
          <Button
            className={classnames(`save-button`)}
            disabled={!this.isLinkValid()}
            onClick={() => this.isLinkValid() && this.props.onSaveLink(this.makeLink())}
          >Save</Button>
        </div>

        {/* Render a dropdown that shows the webhook url inside */}
        <LinkDetailWebhook link={link} />
      </div>

      <div className="link-detail-footer">
        <div className="delete-button" onClick={() => this.props.onDeleteLink(this.makeLink())}>Delete</div>
      </div>
    </div>;
  }
}

export default connect(state => {
  return {
    link: state.links.data.find(link => link.id === state.links.selected),
    links: state.links,
  };
}, dispatch => {
  return {
    onEnableLink(link) {
      dispatch(collectionLinksEnable(link));
    },
    onSaveLink(link) {
      dispatch(collectionLinksSave(link)).then(ok => {
        if (ok) {
          window.location.hash = '#/links';
        }
      });
    },
    onDeleteLink(link) {
      if (window.confirm('Are you sure you want to delete this link?')) {
        dispatch(collectionLinksDelete(link)).then(() => {
          window.location.hash = '#/links';
        });
      }
    },
    onResyncLink(link) {
      dispatch(collectionLinksResync(link));
    },
    onHideLinkSyncStatus(link) {
      dispatch(collectionLinksHideSyncStatus(link));
    },
    onRefreshSync(id) {
      dispatch(collectionLinksRefresh(id));
    },
  };
})(function(props) {
  if (!props.links.loading) {
    return <LinkDetail
      {...props}

      // Key to the amount of data we have, so this is what happens:
      // 1. Page initial render without data, which renders the loading page.
      // 2. Loading finishes, and we have data. The key changes, so rerender the component.
      // 3. Later on, user disabled link. Since the length of data does not change, the whole
      // component is not rerendered. This is good - if the whole component was rerendered, then the
      // animation would go away sicne it would transition abruptly from one state to another.
      // (ie, try keying off `props.links.loading`, then enable / disable a link. You will see what
      // I mean)
      key={props.links.data.length}
      initialLinkState={props.link}
      linkError={props.links.error}
    />;
  } else {
    return <LinkDetail
      // (See above explaination for the key)
      key={props.links.data.length}
      loading={true}
      initialLinkState={props.link}
    />;
  }
});
