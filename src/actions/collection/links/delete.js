import collectionLinksError from './error';
import { API_URL } from '../../../constants';

export const COLLECTION_LINKS_DELETE = 'COLLECTION_LINKS_DELETE';

export default function collectionLinksDelete(link) {
  return async dispatch => {
    try {
      // Issue a request
      const resp = await fetch(`${API_URL}/v1/links/${link.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (resp && resp.ok) {
        // Successfully deleted.
        dispatch({ type: COLLECTION_LINKS_DELETE, item: link });
      } else if (resp) {
        // Some error of some sort.
        const data = await resp.json();
        throw new Error(data.error);
      }
    } catch (err) {
      dispatch(collectionLinksError(`Couldn't delete link: ${err.message}`));
    }
  };
}
