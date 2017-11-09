import React from 'react';

import assert from 'assert';
import sinon from 'sinon';
import { LinkDetail } from './index';

import { mount } from 'enzyme';

const LINK_ALL_FORKS = {
  id: 1,
  name: `Fully formed link`,
  enabled: true,
  upstream: {
    type: 'repo',
    owner: 'hello',
    repo: 'world',
    branch: 'master',
    branches: ['master'],
  },
  fork: {
    type: 'fork-all',
  },
};

const LINK_REPO = {
  id: 1,
  name: `Fully formed link`,
  enabled: true,
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

const timeout = delay => new Promise(r => setTimeout(r, delay));

describe('link detail', function() {
  beforeEach(() => {
    // Mock the fetch call that happens on the first render of the link detail component to get fork
    // details.
    global.fetch = sinon.stub().resolves({
      json() {
        return {
          branches: ['master', 'feature-foo'],
          fork: true,
          parent: {
            owner: LINK_ALL_FORKS.upstream.owner,
            name: LINK_ALL_FORKS.upstream.repo,
            private: false,
            defaultBranch: 'master',
          },
          private: false,
          valid: true,
        };
      },
    });
  });

  it('should render the component (smoke test)', function() {
    // Render the component with fork-all link
    mount(<LinkDetail
      loading={false}
      initialLinkState={LINK_ALL_FORKS}
      linkError={null}
    />);

    // Render component with repo link
    mount(<LinkDetail
      loading={false}
      initialLinkState={LINK_REPO}
      linkError={null}
    />);
  });

  it('should be able to update the upstream repository in the link', async function() {
    const component = mount(<LinkDetail
      loading={false}
      initialLinkState={LINK_ALL_FORKS}
      linkError={null}
    />);

    // Ensure that the owner and repo are set correctly at the start.
    assert.equal(component.state('upstreamOwner'), 'hello');
    assert.equal(component.state('upstreamRepo'), 'world');

    // Mock the `fetchBranches` call.
    global.fetch = sinon.stub().resolves({
      json: () => ({
        valid: true,
        fork: false,
        private: false,
        branches: ['master', 'feature-foo'],
      }),
    });

    // Type a new owner into the owner box.
    component.find('.link-detail-box.owner').simulate('change', {target: {value: '1egoman'}});

    // Verify it was updated.
    assert.equal(component.state('upstreamOwner'), '1egoman');

    // Verify that the repository infrrmation was fetched.
    assert.equal(global.fetch.callCount, 1);

    // Wait for component to figure itself out before continuing
    await timeout(250);
    component.update();

    // Ensure that branches are visible in the view
    assert.equal(component.find('.link-detail-box.branch').children().length, 2);

    // And that the error state is unset
    assert.equal(
      component.find('.link-detail-repository.from .link-detail-repository-header-error').length,
      0
    );

    // Now, edit the repository of the upstream.
    component.find('.link-detail-box.repo').simulate('change', {target: {value: 'backstroke'}});

    // Verify it was updated.
    assert.equal(component.state('upstreamRepo'), 'backstroke');

    // Verify that the repository information was fetched
    assert.equal(global.fetch.callCount, 2); // (1 previous call + 1 call that just happened)

    // Wait for component to figure itself out before continuing
    await timeout(250);
    component.update();

    // Ensure that branches are still visible in the view
    assert.equal(component.find('.link-detail-box.branch').children().length, 2);

    // And that the error state is still unset
    assert.equal(
      component.find('.link-detail-repository.from .link-detail-repository-header-error').length,
      0
    );

    // Lastly, updating the branch should update the state
    component.find('.link-detail-box.branch').simulate('change', {target: {value: 'feature-foo'}});
    assert.equal(component.state('upstreamBranch'), 'feature-foo');
  });

  it('should report an error after changing the owner/repo of the fork', async function() {
    // Mock the api call to the server to get fork info. Simulate an invalid response.
    global.fetch = sinon.stub().resolves({
      json() {
        return {
          fork: false, // Not a fork!
          private: false,
          valid: true,
          parent: null,
          branches: ['master', 'feature-foo'],
        };
      },
    });

    // Start with a link that syncs to all of its forks.
    const component = mount(<LinkDetail
      loading={false}
      initialLinkState={LINK_ALL_FORKS}
      linkError={null}
    />);

    // Click on the `One fork` button to switch the type of the fork (the 2nd child)
    component.find('.link-detail-fork-choice').at(1).simulate('click');

    // Enter an upstream / fork info into the boxes.
    component.find('.from .link-detail-box.owner').simulate('change', {target: {value: 'forkowner'}});
    component.find('.from .link-detail-box.repo').simulate('change', {target: {value: 'forkrepo'}});

    // Wait for promises to settle.
    await timeout(250);
    component.update();

    // Verify that the fork is now in an error state.
    assert.equal(component.state().forkError, `Repo forkowner/forkrepo is not related to the upstream.`);

    // Assert that a fetch call was made to set the fork error state
    assert.equal(global.fetch.callCount, 1);

    // Change the type of fork to `unrelated-repo`
    component.find('.link-detail-fork-choice').at(2).simulate('click');

    // Verify that the fork is imediately no longer in an error state thanks to caching.
    assert.equal(component.state().forkError, null);

    // Wait for promises to settle.
    await timeout(250);
    component.update();

    // And that after waiting for the full request to be made, the fork is still not in an error
    // state.
    assert.equal(component.state().forkError, null);
    assert.equal(global.fetch.callCount, 2);
  });
  it('should report an error after switching from a repo to an unrelated repo, then clear that error when switching to fork-all', async function() {
    // Mock the api call to the server to get fork info. Simulate a valid response for the 
    global.fetch = sinon.stub().resolves({
      json() {
        return {
          fork: true, // Not a fork!
          private: false,
          valid: true,
          parent: {
            owner: LINK_REPO.upstream.owner,
            name: LINK_REPO.upstream.repo,
            private: false,
          },
          branches: ['master', 'feature-foo'],
        };
      },
    });

    // Start with a link that syncs to all of its forks.
    const component = mount(<LinkDetail
      loading={false}
      initialLinkState={LINK_REPO}
      linkError={null}
    />);

    // Wait for initial request to happen.
    await timeout(250);
    component.update();

    // Click on the `Unrelated repo` button to switch the type of the fork (the 3rd child)
    component.find('.link-detail-fork-choice').at(2).simulate('click');

    // Verify that the fork is now in an error state.
    assert.equal(
      component.state().forkError,
      `Repo foo/bar is a fork of the upstream. Please sync to an out-of-network repository.`
    );

    // Wait for promises to settle.
    await timeout(250);
    component.update();

    // Verify that the fork is still in an error state.
    assert.equal(
      component.state().forkError,
      `Repo foo/bar is a fork of the upstream. Please sync to an out-of-network repository.`
    );

    // Assert that a fetch call was made to set the fork error state
    // 2 = (1 initial request at the start of the test + 1 request just now)
    assert.equal(global.fetch.callCount, 2);

    // Change the type of fork to `fork-all`
    component.find('.link-detail-fork-choice').at(0).simulate('click');

    // Verify that the fork is imediately no longer in an error state thanks to caching.
    assert.equal(component.state().forkError, null);

    // Wait for promises to settle.
    await timeout(250);
    component.update();

    // And that after waiting for the full request to be made, the fork is still not in an error
    // state.
    assert.equal(component.state().forkError, null);

    // Assert that a fetch call was made to the server after the fork type was changed to fork-all
    // 3 = (
    //   1 initial request at the start of the test +
    //   1 request when the fork type was changed to unrelated-repo +
    //   1 request just now
    // )
    assert.equal(global.fetch.callCount, 3);
  });
  it('should handle some common validation errors for the fork', async function() {
    // Start with a link that syncs to all of its forks.
    const component = mount(<LinkDetail
      loading={false}
      initialLinkState={LINK_REPO}
      linkError={null}
    />);

    // Start with a fork of type `repo`.
    component.setState({
      upstreamOwner: 'upstream owner',
      upstreamRepo: 'upstream repo',

      forkType: 'repo',
      forkOwner: 'fork owner',
      forkRepo: 'fork repo',
    });

    // When everything is fine, then no validation error is returned.
    assert.equal(component.instance().validateFork({
      valid: true,
      private: false,
      fork: true,
      parent: {
        owner: 'upstream owner',
        name: 'upstream repo',
      },
      branches: ['master'],
    }), null);

    // When the repository in the fork slot isn't actually a fork, return a validation error.
    assert.equal(component.instance().validateFork({
      valid: true,
      private: false,
      fork: false,
      parent: null,
      branches: ['master'],
    }), `Repo fork owner/fork repo is not related to the upstream.`);

    // When the fork's parent isn't actually the correct repo, return a validation error.
    assert.equal(component.instance().validateFork({
      valid: true,
      private: false,
      fork: true,
      parent: {
        owner: 'not the',
        name: 'right repository',
        private: false,
      },
      branches: ['master'],
    }), `Repo fork owner/fork repo is not a fork of upstream owner/upstream repo.`);



    // Next, change to a fork of type `fork-all`
    component.setState({
      upstreamOwner: 'upstream owner',
      upstreamRepo: 'upstream repo',

      forkType: 'fork-all',
    });

    // All forks doesn't have any inputs, and doesn't return validation errors.
    assert.equal(component.instance().validateFork({
      valid: true,
      private: false,
      fork: false,
      parent: null,
      branches: ['master'],
    }), null);


    // Finally, change to a fork of type `unrelated-repo`
    component.setState({
      upstreamOwner: 'upstream owner',
      upstreamRepo: 'upstream repo',

      forkType: 'unrelated-repo',
      forkOwner: 'fork owner',
      forkRepo: 'fork repo',
    });

    // When everything is fine, then no validation error is returned.
    assert.equal(component.instance().validateFork({
      valid: true,
      private: false,
      fork: false,
      parent: {
        owner: 'some other',
        name: 'random repository',
      },
      branches: ['master'],
    }), null);

    // When the repository in the fork slot is an actual fork, return a validation error.
    assert.equal(component.instance().validateFork({
      valid: true,
      private: false,
      fork: true,
      parent: {
        owner: 'upstream owner',
        name: 'upstream repo',
      },
      branches: ['master'],
    }), `Repo fork owner/fork repo is a fork of the upstream. Please sync to an out-of-network repository.`);
  });

  describe('pasting github urls', () => {
    it('should properly format github url when pasted into the upstream owner box', async function() {
      // Start with a link that syncs to all of its forks.
      const component = mount(<LinkDetail
        loading={false}
        initialLinkState={LINK_REPO}
        linkError={null}
      />);

      // Paste a github url into the fork owner box
      component.find('.to .link-detail-box.owner').simulate('change', {
        target: { value: 'https://github.com/1egoman/backstroke' },
      });

      // Ensure that the owner and repo are set properly
      assert.equal(component.state('upstreamOwner'), '1egoman');
      assert.equal(component.state('upstreamRepo'), 'backstroke');

      // Paste a user/repo combo into the repo box too.
      component.find('.to .link-detail-box.owner').simulate('change', {
        target: { value: 'backstrokeapp/dashboard' },
      });

      // Ensure that the owner and repo are set properly
      assert.equal(component.state('upstreamOwner'), 'backstrokeapp');
      assert.equal(component.state('upstreamRepo'), 'dashboard');
    });
    it('should properly format github url when pasted into the fork owner box', async function() {
      // Start with a link that syncs to all of its forks.
      const component = mount(<LinkDetail
        loading={false}
        initialLinkState={LINK_REPO}
        linkError={null}
      />);

      // Paste a github url into the fork owner box
      component.find('.from .link-detail-box.owner').simulate('change', {
        target: { value: 'https://github.com/1egoman/backstroke' },
      });

      // Ensure that the owner and repo are set properly
      assert.equal(component.state('forkOwner'), '1egoman');
      assert.equal(component.state('forkRepo'), 'backstroke');

      // Paste a user/repo combo into the repo box too.
      component.find('.from .link-detail-box.owner').simulate('change', {
        target: { value: 'backstrokeapp/dashboard' },
      });

      // Ensure that the owner and repo are set properly
      assert.equal(component.state('forkOwner'), 'backstrokeapp');
      assert.equal(component.state('forkRepo'), 'dashboard');
    });
  });

  describe('resync', () => {
    it('should resync a link when the resync button is pressed', async function() {
      // Create a spy to call when a link is resynced.
      const spy = sinon.spy();

      // Render the component, passing in the spy we created.
      const component = mount(<LinkDetail
        loading={false}
        initialLinkState={LINK_REPO}
        linkError={null}
        onResyncLink={spy}
      />);

      // Click resync button
      component.find('Button.link-detail-refresh').simulate('click');

      // Confirm that spy was called.
      assert.equal(spy.callCount, 1);
    });
    it('should not resync a link when the link is disabled', async function() {
      // Create a spy to call when a link is resynced.
      const spy = sinon.spy();

      // Render the component, passing in the spy we created.
      const component = mount(<LinkDetail
        loading={false}
        initialLinkState={{...LINK_REPO, enabled: false}} // Disabled link
        linkError={null}
        onResyncLink={spy}
      />);

      // Click resync button
      component.find('Button.link-detail-refresh').simulate('click');

      // Confirm that spy was not called.
      assert.equal(spy.callCount, 0);

      // Also, ensure that the resync button is disabled
      assert.equal(component.find('Button.link-detail-refresh').prop('disabled'), true);
    });
    it('should not resync a link when the link is already syncing', async function() {
      // Create a spy to call when a link is resynced.
      const spy = sinon.spy();

      // Render the component, passing in the spy we created.
      const component = mount(<LinkDetail
        loading={false}
        initialLinkState={{
          ...LINK_REPO,
          // Syncing is in progress
          lastWebhookSync: {status: 'TRIGGERED'}
        }}
        linkError={null}
        onResyncLink={spy}
      />);

      // Click resync button
      component.find('Button.link-detail-refresh').simulate('click');

      // Confirm that spy was not called.
      assert.equal(spy.callCount, 0);

      // Also, ensure that the resync button is disabled
      assert.equal(component.find('Button.link-detail-refresh').prop('disabled'), true);
    });
  });
});
