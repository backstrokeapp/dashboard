import * as React from 'react';
import './styles.css';

import { connect } from 'react-redux';

import LinkDetail from '../link-detail/index';
import LinkList from '../link-list/index';
import LoginConfirmation from '../login-confirmation/index';
import LinkDetailOperations from '../link-detail-operations/index';

export function App({activePage}) {
  if (activePage === 'link-list') {
    return <LinkList />;
  } else if (activePage === 'link-detail') {
    return <div className="app-link-detail-container">
      <LinkDetail />
      <LinkDetailOperations />
    </div>;
  } else if (activePage === 'login-confirmation') {
    return <LoginConfirmation />;
  } else {
    return <div className="unknown-page">
      Unknown page!
    </div>;
  }
}

export default connect(state => {
  return {activePage: state.activePage};
})(App);
