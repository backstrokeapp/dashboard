import * as React from 'react';
import './styles.css';
import { connect } from 'react-redux';
import classnames from 'classnames';

import ColorHash from 'color-hash';

import collectionLinksEnable from '../../actions/collection/links/enable';
import collectionLinksCreate from '../../actions/collection/links/create';

import Switch from '../toggle-switch/index';
import LinkError from '../link-error/index';
import Button from '../button/index';

import { API_URL } from '../../constants';

import Logo from '../../images/Logo.png';
import NoLinks from '../../images/No Links.png';

const ch = new ColorHash();

// When passed a link, return the width that the given link item should be on the dashboard.
// This function is resiliant to links that may not have been completely created yet or falsey
// values.
function getLinkItemWidth(link) {
  if (!link || !link.name) {
    return null;
  } else {
    if (link.name.length > 32) {
      return 3;
    } else if (link.name.length > 16) {
      return 2;
    } else {
      return 1;
    }
  }
}

export function LinkList({
  links,

  onEnableLink,
  onSelectLink,
  onCreateLink,
  onLogout,
}) {
  let body;

  if (links.error) {
    body = <LinkError error={links.error} />;
  } else if (links.data.length === 0 && !links.loading) {
    body = <ul className="link-list">
      <li className="link-list-item-empty">
        <p>You haven't created any links.</p>
        <img className="link-list-item-empty-visual" src={NoLinks} alt="No links" />
        <Button
          className="link-list-create-button"
          color="dark"
          onClick={onCreateLink}
        >Create Link</Button>
      </li>
    </ul>
  } else {
    body = <ul className="link-list">
      {links.data.map(link => {
        const themeColor = ch.hex(link.name);

        return <li
          className={classnames({
            'link-list-item': true,
            'link-list-item-loading': links.loading && links.loadingSection === link.id,
            // If name is 16-32 characters wide, make the cell double width.
            'link-list-item-double-width': getLinkItemWidth(link) === 2,
            // If name is over 32 characters wide, make the cell triple width.
            'link-list-item-triple-width': getLinkItemWidth(link) === 3,
          })}
          key={link.id}
          style={{backgroundColor: link.enabled ? themeColor : null}}
        >
          <div className="link-list-item-header">
            {link.name || "Untitled"}
          </div>
          <div className="link-list-item-switch">
            <Switch checked={link.enabled} onChange={() => onEnableLink(link)} />
            <div
              className="link-list-item-edit"
              onClick={() => onSelectLink(link.id)}
            >Edit</div>
          </div>
        </li>;
      })}
    </ul>;
  }

  return <div className="link-list-container">
    <img
      alt="Backstroke"
      className="link-list-logo"
      src={Logo}
    />

  {links.data.length > 0 ? <div className="link-list-create-button-container">
    <Button
      className="link-list-create-button"
      color="dark"
      onClick={onCreateLink}
    >Create Link</Button>
  </div> : null}

    {/* The list "card" of links */}
    {body}

    <div className="link-list-footer">
      <a className="logout" onClick={onLogout}>Logout</a>
    </div>
  </div>;
}

export default connect(state => {
  return {
    links: state.links,
  };
}, dispatch => {
  return {
    onSelectLink(id) {
      window.location.hash = '/links/' + id;
    },
    onCreateLink() {
      dispatch(collectionLinksCreate()).then(link => {
        if (link) {
          window.location.hash = '/links/' + link.id;
        }
      });
    },
    onEnableLink(link) {
      dispatch(collectionLinksEnable(link));
    },
    onLogout() {
      window.location.href = `${API_URL}/logout`;
    }
  }
})(LinkList);
