import collectionLinksError from './error';
import collectionLinksPush from './push';
import collectionLinksStartLoading from './start-loading';

import { API_URL } from '../../../constants';

export default function refresh(id) {
  return async dispatch => {
    try {
      dispatch(collectionLinksStartLoading());
      const resp = await fetch(`${API_URL}/v1/links/${id}`, {credentials: 'include'});

      if (resp.ok) {
        const data = await resp.json()
        dispatch(collectionLinksPush(data))
      } else {
        throw new Error(`Received an error: ${resp.statusCode}`);
      }
    } catch (err) {
      dispatch(collectionLinksError(err));
    }
  }
}
