import collectionLinksError from './error';
import collectionLinksPush from './push';
import collectionLinksStartLoading from './start-loading';
import { API_URL } from '../../../constants';

export default function collectionLinksSave(link) {
  return async dispatch => {
    // Starting an async operation.
    dispatch(collectionLinksStartLoading());

    try {
      // Tell server that we want to add a new item
      const resp = await fetch(`${API_URL}/v1/links/${link.id}`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(link),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (resp && resp.ok) {
        // Operation was successful. Add item to collection.
        const item = await resp.json();
        dispatch(collectionLinksPush(item));
      } else if (resp) {
        // Some error happened.
        const data = await resp.json();
        throw new Error(data.error);
      }
      return true;
    } catch (err) {
      dispatch(collectionLinksError(`Couldn't save link: ${err.message}`));
      return false;
    }
  };
}
