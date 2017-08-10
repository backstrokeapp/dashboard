import collectionLinksError from './error';
import collectionLinksSet from './set';
import { API_URL } from '../../../constants';

export const COLLECTION_LINKS_FETCH = 'COLLECTION_LINKS_FETCH';

export default function collectionLinksFetch() {
  return async dispatch => {
    try {
      const resp = await fetch(`${API_URL}/v1/links`, {credentials: 'include'});

      if (resp && resp.ok) {
        const {data, page} = await resp.json();
        dispatch(collectionLinksSet(data, page));
      } else if (resp) {
        const data = await resp.text();
        dispatch(collectionLinksError(`Error fetching links: ${data}`));
      }
    } catch (err) {
      dispatch(collectionLinksError(`Couldn't fetch link collection: ${err.message}`));
    }
  };
}
