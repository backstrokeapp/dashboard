import collectionLinksError from './error';
import collectionLinksPush from './push';
import collectionLinksStartLoading from './start-loading';
import { API_URL } from '../../../constants';

export default function collectionLinksEnable(link) {
  const desiredEnabledState = !link.enabled;
  return async dispatch => {
    // Starting an async operation.
    dispatch(collectionLinksStartLoading());

    try {
      const resp = await fetch(`${API_URL}/v1/links/${link.id}/enable`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          enabled: desiredEnabledState,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (resp && resp.ok) {
        // Operation successful, link is enabled/disabled
        dispatch(collectionLinksPush({...link, enabled: desiredEnabledState}));
      } else if (resp) {
        // Some error happened.
        const data = await resp.json();
        throw new Error(data.error);
      }
    } catch (err) {
      dispatch(collectionLinksError(`Couldn't enable link: ${err.message}`));
    }
  };
}
