import React from 'react';

import assert from 'assert';
import Switch from './index';

import { mount } from 'enzyme';

describe('toggle switch', function() {
  it('should render a switch (smoke test)', function() {
    const component = mount(<Switch
      checked={true}
      onChange={() => null}
    />);
  });
  it('should render a number of switches and they should all have different ids', function() {
    const components = [0, 1, 2].map(i => mount(<Switch
      checked={true}
      onChange={() => null}
    />));

    // Extract ids that were given to each switch
    const oneId = components[0].find('label').prop('htmlFor');
    const twoId = components[1].find('label').prop('htmlFor');
    const threeId = components[2].find('label').prop('htmlFor');

    // Ensure all ids are not equal.
    assert.notEqual(oneId, twoId);
    assert.notEqual(twoId, threeId);
    assert.notEqual(threeId, oneId);
  });
});
