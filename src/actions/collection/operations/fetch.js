import collectionOperationsError from './error';
import collectionOperationsSet from './set';
import { API_URL } from '../../../constants';

export const COLLECTION_OPERATIONS_FETCH = 'COLLECTION_OPERATIONS_FETCH';

export default function collectionOperationsFetch(linkId) {
  return async (dispatch, getState) => {
    // Ensure that a link is selected before fetching operations for it.
    const selectedLinkId = getState().links.selected || linkId;
    if (selectedLinkId === null) {
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/v1/links/${selectedLinkId}/operations?detail=true`, {credentials: 'include'});
      if (resp.ok) {
        const data = await resp.json();
        dispatch(collectionOperationsSet(data));
      }
    } catch (err) {
      dispatch(collectionOperationsError(`Couldn't fetch operations for link ${selectedLinkId}: ${err.message}`));
    }
  };
}
