import * as React from 'react';
import './styles.css';

import { connect } from 'react-redux';

import LinkDetail from '../link-detail/index';
import LinkList from '../link-list/index';
import LoginConfirmation from '../login-confirmation/index';

export function App({activePage}) {
  if (activePage === 'link-list') {
    return <LinkList />;
  } else if (activePage === 'link-detail') {
    return <LinkDetail />;
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
