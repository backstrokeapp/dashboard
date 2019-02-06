import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './components/app/index';
import EnvironmentSwitcher from './components/environment-switcher/index';
import mixpanel from 'mixpanel-browser';
import Raven from 'raven-js';

import './styles.css';

import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import {Provider} from 'react-redux';

import createRouter from '@density/conduit';
import userSet from './actions/user/set';
import collectionLinksError from './actions/collection/links/error';
import routeTransitionLinkList from './actions/route-transition/link-list';
import routeTransitionLinkDetail from './actions/route-transition/link-detail';
import routeTransitionLoginConfirmation from './actions/route-transition/login-confirmation';

import { API_URL, setApiUrl } from './constants';

import activePage from './reducers/active-page';
import links from './reducers/links';
import user from './reducers/user';

const reducer = combineReducers({
  activePage,
  links,
  user,
});

const store = createStore(reducer, {}, compose(
  applyMiddleware(thunk),
  window.devToolsExtension ? window.devToolsExtension() : f => f
));

// Add a router. This handles the transition between the list page and the detail page.
const router = createRouter(store);
router.addRoute('links', () => routeTransitionLinkList());
router.addRoute('links/:id', id => routeTransitionLinkDetail(id));


// Initialize analytics
if (process.env.REACT_APP_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN);
  mixpanel.track('Dashboard view');
}

// Initialze error reporting
if (process.env.REACT_APP_SENTRY_DSN) {
  Raven.config(process.env.REACT_APP_SENTRY_DSN).install();
  window.onerror = e => Raven.captureException(e)
}

function ready() {
  // Kick off a request to get the currently logged in user.
  fetch(`${API_URL}/v1/whoami`, {
    credentials: 'include',
  }).then(resp => {
    if (resp.ok) {
      return resp.json().then(data => {
        // Store analytics for a given user
        if (process.env.REACT_APP_MIXPANEL_TOKEN) {
          mixpanel.identify(data.id);
          mixpanel.alias(data.id);
        }

        store.dispatch(userSet(data));
      });
    } else if (resp.status === 401 || resp.status === 403) {
      // User isn't logged in, send them to the login page.
      // We don't want to listen for any error here, because if this call returns (for example) a 500,
      // then we'd redirect to /setup/login, which would redirect to this page again, causing an
      // infinite loop.
      store.dispatch(routeTransitionLoginConfirmation());
      window.location.href = `${API_URL}/setup/login`;
    } else {
      // An undefined error.
      store.dispatch(collectionLinksError(`Error fetching login state: ${resp.status}`));
    }
  });

  // Kick off data fetching depending on route, initially.
  if (window.location.hash === '') {
    // Dispatch a route transition.
    window.location.hash = '#/links';
  } else {
    // Handle the existing state of the page.
    router.handle();
  }
}

ReactDOM.render(<Provider store={store}>
  <div>
    <div class="shutdown-notice">
      <h1>Backstroke has shut down.</h1>
      <p>
        This application is here purely for historical reasons - see the notice in the{' '}
        <a href="https://github.com/backstrokeapp/server#i-dont-have-the-bandwidth-to-maintain-backstroke-anymore">README</a>
        {' '}for more information. Thanks for the fun ride all these years!
      </p>
      <p>
        - <a href="https://rgaus.net">Ryan Gaus</a>
      </p>
    </div>
    <App />
    <EnvironmentSwitcher
      keys={['!', '!', '`', ' ']} // Press '!!` ' to open environment switcher.
      fields={[
        {
          name: 'Server',
          slug: 'server',
          defaults: {
            'Production': 'https://api.backstroke.co',
            'Local': 'http://localhost:8000',
            'Env (REACT_APP_API_URL)': process.env.REACT_APP_API_URL,
          },
          default: process.env.NODE_ENV === 'production' ? 'Production' : 'Local',
        }
      ]}
      onChange={({server}) => {
        setApiUrl(server);
        ready();
      }}
    />
  </div>
</Provider>, document.getElementById('root'));
registerServiceWorker();
