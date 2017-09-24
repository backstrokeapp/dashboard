import { API_URL } from '../../../constants';

import collectionLinksError from './error';
import collectionLinksPush from './push';
import collectionLinksStartLoading from './start-loading';

export default function resync(link) {
  return async dispatch => {
    // Set initial state for resync operation.
    dispatch(collectionLinksPush({
      ...link,
      lastWebhookSync: {status: 'SENDING'},
    }));
    dispatch(collectionLinksStartLoading());

    try {
      const resp = await fetch(`${API_URL}/_${link.webhook}`);
      if (resp.ok) {
        // Fetch the status url to poll for a status message.
        const data = await resp.json();
        const statusUrl = data.statusUrl;

        // Note down the time that the webhook sync started.
        dispatch(collectionLinksPush({
          ...link,
          lastWebhookSync: {status: 'TRIGGERED'},
        }));

        // Poll the status url to fetch the response payload.
        const interval = setInterval(() => {
          return fetch(statusUrl).then(async resp => {
            if (resp.ok) {
              const response = await resp.json();

              dispatch(collectionLinksPush({
                ...link,
                lastWebhookSync: response,
              }));

              if (response.status === 'OK') {
                // Turn off the timer.
                clearInterval(interval);
              }
            }
          });
        }, 1000);
      } else {
        throw new Error(`Recived an error: ${resp.statusCode}`);
      }
    } catch (err) {
      dispatch(collectionLinksError(err));
    }
  }
}
