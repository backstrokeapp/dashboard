import { API_URL } from '../../../constants';

import collectionLinksError from './error';
import collectionLinksPush from './push';
import collectionLinksStartLoading from './start-loading';

import collectionOperationsFetch from '../operations/fetch';
import collectionOperationsSelect from '../operations/select';

export default function resync(link) {
  return async dispatch => {
    // Set initial state for resync operation.
    dispatch(collectionLinksPush({...link, linkOperation: 'SENDING'}));
    dispatch(collectionLinksStartLoading());

    try {
      const resp = await fetch(`${API_URL}/_${link.webhook}`);
      if (resp.ok) {
        // Fetch the status url to poll for a status message.
        const data = await resp.json();
        const operationId = data.enqueuedAs;

        // Update the lock in the link to reflect that a new link operation was created.
        dispatch(collectionLinksPush({...link, linkOperation: 'TRIGGERED'}));

        // Poll the status url to fetch the response payload.
        const interval = setInterval(async () => {
          const operations = await dispatch(collectionOperationsFetch(link.id));
          const operation = operations.find(i => i.id === operationId);
          if (operation) {
            // Reset the lock in the link, allowing the user to manually sync again.
            dispatch(collectionLinksPush({...link, linkOperation: undefined}));

            // Select the latest link operation
            dispatch(collectionOperationsSelect(operation.id));

            // Turn off the timer once we receive a final status
            if (operation.status === 'OK' || operation.status === 'ERROR') {
              clearInterval(interval);
            }
          }
        }, 1000);
      } else {
        throw new Error(`Recived an error: ${resp.statusCode}`);
      }
    } catch (err) {
      dispatch(collectionLinksError(err));
    }
  }
}
