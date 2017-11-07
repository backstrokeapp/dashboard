import assert from 'assert';
import links from './index';

import collectionLinksSet from '../../actions/collection/links/set';
import collectionLinksPush from '../../actions/collection/links/push';
import { COLLECTION_LINKS_DELETE } from '../../actions/collection/links/delete';
import collectionLinksStartLoading from '../../actions/collection/links/start-loading';
import collectionLinksError from '../../actions/collection/links/error';

import routeTransitionLinkDetail from '../../actions/route-transition/link-detail';
import routeTransitionLinkList from '../../actions/route-transition/link-list';

const initialState = links(undefined, {});

const LINK_ONE = {
  id: 1,
  name: `Fully formed link`,
  upstream: {
    type: 'repo',
    owner: 'hello',
    repo: 'world',
    branch: 'master',
    branches: ['master'],
  },
  fork: {
    type: 'repo',
    owner: 'foo',
    repo: 'bar',
    branch: 'master',
    branches: ['master'],
  },
};
const LINK_TWO = {
  id: 2,
  name: `Fully formed link number 2`,
  upstream: {
    type: 'repo',
    owner: '1egoman',
    repo: 'backstroke',
    branch: 'master',
    branches: ['master'],
  },
  fork: {
    type: 'repo',
    owner: 'myfork',
    repo: 'backstroke',
    branch: 'master',
    branches: ['master'],
  },
};

describe('links', function() {
  describe('core operations', function() {
    it('should add links to the collection when they are set', function() {
      const response = links(undefined, collectionLinksSet([
        LINK_ONE,
        LINK_TWO,
        {
          id: 3,
          name: `Fully formed link`,
          /* no upstream */
          /* no fork */
        },
      ]));

      // Ensure that the response is what's expected.
      assert.deepEqual(response, {
        ...initialState,
        data: [
          LINK_ONE,
          LINK_TWO,
          {
            id: 3,
            name: `Fully formed link`,
            upstream: {type: 'repo', branches: []},
            fork: {type: 'fork-all'},
          },
        ],
        loading: false,
      });
    });
    it('should add links to the collection when they are pushed', function() {
      const response = links(undefined, collectionLinksPush(LINK_ONE));

      // Ensure that the response is what's expected.
      assert.deepEqual(response, {
        ...initialState,
        data: [LINK_ONE],
        loading: false,
      });
    });
    it('should remove links from the collection when they are deleted', function() {
      // Set the contents of the store.
      const state = links(undefined, collectionLinksSet([LINK_ONE, LINK_TWO]));

      // Delete one of the set items.
      const response = links(state, {type: COLLECTION_LINKS_DELETE, item: LINK_ONE});

      // Ensure that the response is what's expected.
      assert.deepEqual(response, {
        ...initialState,
        data: [LINK_TWO],
        loading: false,
      });
    });
  });

  describe('route transitions', function() {
    it('should set the selected link on route transition to the link detail page', function() {
      // Create an instance of the thunk `routeTransitionLinkDetail`
      const thunk = routeTransitionLinkDetail('5');

      // Each time it's called, run the resulting action through the `links` reducer, updating the
      // state in `response`.
      let response = undefined;
      thunk(action => {
        response = links(response, action);
      });

      // Ensure that the response is what's expected.
      assert.deepEqual(response, {
        ...initialState,
        selected: 5,
        error: null,
      });
    });
    it('should reset the error state on route transititon to link list page', function() {
      // Create an instance of the thunk `routeTransitionLinkList`
      const thunk = routeTransitionLinkList();

      // Each time it's called, run the resulting action through the `links` reducer, updating the
      // state in `response`.
      let response = undefined;
      thunk(action => {
        response = links(response, action);
      });

      // Ensure that the response is what's expected.
      assert.deepEqual(response, {
        ...initialState,
        error: null,
      });
    });
  });

  it('should start whole page loading on a start loading action by default', function() {
    const response = links(undefined, collectionLinksStartLoading());
    assert.deepEqual(response, {
      ...initialState,
      loading: true,
      loadingSection: 'whole-page',
    });
  });
  it('should start another type of loading loading on a start loading action', function() {
    const response = links(undefined, collectionLinksStartLoading('other-loading'));
    assert.deepEqual(response, {
      ...initialState,
      loading: true,
      loadingSection: 'other-loading',
    });
  });

  it('should report and error when error action is dispatched', function() {
    const response = links(undefined, collectionLinksError(new Error('Boom!')));
    assert.deepEqual(response, {
      ...initialState,
      error: 'Boom!',
      loading: false,
    });
  });

  it('should do nothing for an unknown action', function() {
    const response = links(undefined, {type: 'UNKNOWN_ACTION'});
    assert.deepEqual(response, initialState);
  });
});
