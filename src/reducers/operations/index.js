import { COLLECTION_OPERATIONS_SET } from '../../actions/collection/operations/set';
import { COLLECTION_OPERATIONS_SELECT } from '../../actions/collection/operations/select';

const initialState = {
  selected: null,
  data: [],
  error: null,
};

export default function operations(state=initialState, action) {
  switch (action.type) {

  case COLLECTION_OPERATIONS_SET:
    return {
      ...state,
      data: action.data,
      error: null,
    };

  case COLLECTION_OPERATIONS_SELECT:
    return {...state, selected: action.data, error: null};

  default:
    return state;
  }
}
