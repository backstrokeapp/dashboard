import React from 'react';

import assert from 'assert';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { LinkDetailOperations } from './index';

const OPERATIONS_COLLECTION = {
  selected: null,
  loading: false,
  data: [
    {id: 'e41811db', status: 'RUNNING', startedAt: '2017-11-20T11:40:31.188Z'},
    {id: '85ab4a23', status: 'OK', startedAt: '2017-11-20T11:40:31.188Z', finishedAt: '2017-11-20T11:40:32.188Z'},
    {id: '80765d0a', status: 'ERROR', startedAt: '2017-11-20T11:40:31.188Z', finishedAt: '2017-11-20T11:40:32.188Z'},
  ],
};
const LINKS_COLLECTION = {
  selected: 3,
  loading: false,
  data: [
    {id: 1, name: 'Foo', enabled: true, lastSyncedAt: '2017-11-20T11:40:31.188Z'},
    {id: 2, name: 'Bar', enabled: true, lastSyncedAt: '2017-11-20T11:40:31.188Z'},
    {id: 3, name: 'Baz', enabled: true, lastSyncedAt: '2017-11-20T11:40:31.188Z'},
  ],
};

describe('link detail operations', function() {
  it('should render the component (smoke test)', function() {
    const noop = f => f;
    mount(<LinkDetailOperations
      operations={OPERATIONS_COLLECTION}
      links={LINKS_COLLECTION}

      onSelectOperation={noop}
      onResyncLink={noop}
    />);
  });

  it('should try to select an operation when clicked', function() {
    const onSelectOperation = sinon.stub();
    const onResyncLink = sinon.stub();
    const component = mount(<LinkDetailOperations
      operations={OPERATIONS_COLLECTION}
      links={LINKS_COLLECTION}
      onSelectOperation={onSelectOperation}
      onResyncLink={onResyncLink}
    />);

    // Click the first item in the operations list
    component.find('.link-detail-operations-item-header').first().simulate('click');

    // Ensure that the callback was fired
    assert.equal(onSelectOperation.callCount, 1);

    // Ensure that the callback was passed the correct operation id
    assert.deepEqual(onSelectOperation.firstCall.args, [OPERATIONS_COLLECTION.data[0].id]);

    // Click another item
    component.find('.link-detail-operations-item-header').last().simulate('click');

    // Ensure that the callback was fired (again)
    assert.equal(onSelectOperation.callCount, 2);

    // Ensure that the callback was passed the correct operation id
    assert.deepEqual(onSelectOperation.lastCall.args, [OPERATIONS_COLLECTION.data[2].id]);
  });

  it('should show a empty state when no operations are found', function() {
    const onSelectOperation = sinon.stub();
    const onResyncLink = sinon.stub();
    const component = mount(<LinkDetailOperations
      operations={{selected: null, loading: false, data: []}}
      links={LINKS_COLLECTION}
      onSelectOperation={onSelectOperation}
      onResyncLink={onResyncLink}
    />);

    // Look for the empty state message / icon container
    assert.equal(component.find('.link-detail-operations-error').length, 1);
  });

  describe('resync', () => {
    it('should resync a link when the resync button is pressed', async function() {
      // Create a spy to call when a link is resynced.
      const spy = sinon.spy();

      // Render the component, passing in the spy we created.
      const component = mount(<LinkDetailOperations
        operations={OPERATIONS_COLLECTION}
        links={LINKS_COLLECTION}
        onResyncLink={spy}
      />);

      // Click resync button
      component.find('Button.link-detail-operations-resync').simulate('click');

      // Confirm that spy was called.
      assert.equal(spy.callCount, 1);
    });
    it('should not resync a link when the link is disabled', async function() {
      // Create a spy to call when a link is resynced.
      const spy = sinon.spy();

      // Render the component, passing in the spy we created.
      const component = mount(<LinkDetailOperations
        operations={OPERATIONS_COLLECTION}
        links={{
          selected: 1,
          loading: false,
          data: [
            {id: 1, name: 'Foo', enabled: false, lastSyncedAt: '2017-11-20T11:40:31.188Z'},
          ],
        }}
        onResyncLink={spy}
      />);

      // Click resync button
      component.find('Button.link-detail-operations-resync').simulate('click');

      // Confirm that spy was not called.
      assert.equal(spy.callCount, 0);

      // Also, ensure that the resync button is disabled
      assert.equal(component.find('Button.link-detail-operations-resync').prop('disabled'), true);
    });
    it('should not resync a link when the link is already syncing', async function() {
      // Create a spy to call when a link is resynced.
      const spy = sinon.spy();

      // Render the component, passing in the spy we created.
      const component = mount(<LinkDetailOperations
        operations={OPERATIONS_COLLECTION}
        links={{
          selected: 1,
          loading: false,
          data: [
            {
              id: 1,
              name: 'Foo',
              enabled: false,
              lastSyncedAt: '2017-11-20T11:40:31.188Z',
              // Waiting for operation to return a result when its status is fetched.
              linkOperation: 'TRIGGERED',
            },
          ],
        }}
        onResyncLink={spy}
      />);

      // Click resync button
      component.find('Button.link-detail-operations-resync').simulate('click');

      // Confirm that spy was not called.
      assert.equal(spy.callCount, 0);

      // Also, ensure that the resync button is disabled
      assert.equal(component.find('Button.link-detail-operations-resync').prop('disabled'), true);
    });
  });
});
