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

describe('button', function() {
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
      component.find('.link-detail-repository.from .link-detail-repository-header-error').text(),
      ''
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
      component.find('.link-detail-repository.from .link-detail-repository-header-error').text(),
      ''
    );

    // Lastly, updating the branch should update the state
    component.find('.link-detail-box.branch').simulate('change', {target: {value: 'feature-foo'}});
    assert.equal(component.state('upstreamBranch'), 'feature-foo');
  });
  it('should be able to update the fork repository in a link that has a fork repo', async function() {
    const component = mount(<LinkDetail
      loading={false}
      initialLinkState={LINK_REPO}
      linkError={null}
    />);

    // Ensure that the owner and repo are set correctly at the start.
    assert.equal(component.state('forkOwner'), 'foo');
    assert.equal(component.state('forkRepo'), 'bar');

    // Mock the `fetchBranches` call.
    global.fetch = sinon.stub().resolves({
      json: () => ({
        valid: true,
        fork: true,
        private: false,
        branches: ['master', 'feature-foo'],
      }),
    });

    // Type a new owner into the owner box.
    component.find('.from .link-detail-box.owner').simulate('change', {target: {value: '1egoman'}});

    // Verify it was updated.
    assert.equal(component.state('forkOwner'), '1egoman');

    // Verify that the repository infrrmation was fetched.
    assert.equal(global.fetch.callCount, 1);

    // Wait for component to figure itself out before continuing
    await timeout(250);
    component.update();

    // Ensure that branches are visible in the view
    assert.equal(component.find('.from .link-detail-box.branch').children().length, 2);

    // And that the error state is unset
    assert.equal(
      component.find('.from .link-detail-repository-header-error').text(),
      ''
    );

    // Now, edit the repository of the fork.
    component.find('.from .link-detail-box.repo').simulate('change', {target: {value: 'backstroke'}});

    // Verify it was updated.
    assert.equal(component.state('forkRepo'), 'backstroke');

    // Verify that the repository information was fetched
    assert.equal(global.fetch.callCount, 2); // (1 previous call + 1 call that just happened)

    // Wait for component to figure itself out before continuing
    await timeout(250);
    component.update();

    // Ensure that branches are still visible in the view
    assert.equal(component.find('.from .link-detail-box.branch').children().length, 2);

    // And that the error state is still unset
    assert.equal(
      component.find('.from .link-detail-repository-header-error').text(),
      ''
    );

    // Lastly, updating the branch should update the state
    component.find('.from .link-detail-box.branch').simulate('change', {target: {value: 'feature-foo'}});
    assert.equal(component.state('forkBranch'), 'feature-foo');
  });

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
