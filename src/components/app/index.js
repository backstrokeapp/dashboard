import * as React from 'react';
import './styles.css';

import { connect } from 'react-redux';

import LinkDetail from '../link-detail/index';
import LinkList from '../link-list/index';
import Login from '../login/index';

export function App({activePage}) {
  if (activePage === 'login') {
    return <Login />;
  } else if (activePage === 'link-list') {
    return <LinkList />;
  } else if (activePage === 'link-detail') {
    return <LinkDetail />;
  } else {
    return <div className="unknown-page">
      Unknown page!
    </div>;
  }
}

export default connect(state => {
  return {activePage: state.activePage};
})(App);
