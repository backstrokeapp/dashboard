import assert from 'assert';
import activePage from './index';

import routeTransitionLinkDetail from '../../actions/route-transition/link-detail';
import routeTransitionLinkList from '../../actions/route-transition/link-list';
import routeTransitionLoginConfirmation from '../../actions/route-transition/login-confirmation';

describe('active-page', function() {
  it('should switch the active page to link list', function() {
    // Initialize the route transition thunk.
    const thunk = routeTransitionLinkList();

    // Apply the each action the thunk emits to the reducer.
    let response = undefined;
    thunk(action => {
      response = activePage(response, action)
    });

    // Assert the final value.
    assert.equal(response, 'link-list');
  });
  it('should switch the active page to link detail', function() {
    // Initialize the route transition thunk.
    const thunk = routeTransitionLinkDetail();

    // Apply the each action the thunk emits to the reducer.
    let response = undefined;
    thunk(action => {
      response = activePage(response, action)
    });

    // Assert the final value.
    assert.equal(response, 'link-detail');
  });
  it('should switch the active page to login confirmation', function() {
    // Initialize the route transition thunk.
    const thunk = routeTransitionLoginConfirmation();

    // Apply the each action the thunk emits to the reducer.
    let response = undefined;
    thunk(action => {
      response = activePage(response, action)
    });

    // Assert the final value.
    assert.equal(response, 'login-confirmation');
  });
});
