import assert from 'assert';
import user from './index';

import userSet from '../../actions/user/set';

const USER = { username: '1egoman' };

describe('user', function() {
  it('should set the content of the user', function() {
    const response = user(undefined, userSet(USER));
    assert.equal(response, USER);
  });
});
