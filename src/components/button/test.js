import React from 'react';

import assert from 'assert';
import sinon from 'sinon';
import Button from './index';

import { mount } from 'enzyme';

describe('button', function() {
  it('should render a button (smoke test)', function() {
    mount(<Button>foo</Button>);
  });
  it('should render a button with a special color', function() {
    const component = mount(<Button color="magenta">foo</Button>);

    // Make sure that the button contains the class to color the button properly.
    assert.notEqual(
      component.find('button').prop('className').split(' ').indexOf('button-color-magenta'),
      -1
    );
  });
  it('should render a disabled button', function() {
    const component = mount(<Button disabled>foo</Button>);

    // Make sure that the button contains the class to color the button properly.
    assert.notEqual(
      component.find('button').prop('className').split(' ').indexOf('disabled'),
      -1
    );
  });
  it('should render a button and click it', function() {
    const spy = sinon.spy();
    const component = mount(<Button onClick={spy}>foo</Button>);

    // Click on the button
    component.simulate('click');

    // Ensure the spy was called.
    assert.equal(spy.callCount, 1);
  });
});
