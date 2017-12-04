import assert from 'assert';
import operations from './index';

import collectionOperationsSet from '../../actions/collection/operations/set';
import collectionOperationsSelect from '../../actions/collection/operations/select';

const initialState = operations(undefined, {type: 'NOOP'});

const OPERATIONS = [
  {id: 'e41811db', status: 'RUNNING', startedAt: '2017-11-20T11:40:31.188Z'},
  {id: '85ab4a23', status: 'OK', startedAt: '2017-11-20T11:40:31.188Z', finishedAt: '2017-11-20T11:40:32.188Z'},
  {id: '80765d0a', status: 'ERROR', startedAt: '2017-11-20T11:40:31.188Z', finishedAt: '2017-11-20T11:40:32.188Z'},
];

describe('operations', function() {
  it('should set content', function() {
    const result = operations(initialState, collectionOperationsSet(OPERATIONS));
    assert.deepEqual(result, {...initialState, error: null, data: OPERATIONS});
  });
  it('should select an operation', function() {
    const result = operations(initialState, collectionOperationsSelect(OPERATIONS[0].id));
    assert.deepEqual(result, {...initialState, selected: OPERATIONS[0].id, error: null, data: []});
  });
});
