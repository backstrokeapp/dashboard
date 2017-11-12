import collectionLinksError from './error';
import collectionLinksSet from './set';
import { API_URL } from '../../../constants';

export const COLLECTION_LINKS_FETCH = 'COLLECTION_LINKS_FETCH';

export default function collectionLinksFetch() {
  return async dispatch => {
    try {
      let currentPage = 0;
      let aggregatedData = [];

      // Aggregate through each page of data, merging them all into one big collection.
      while (true) {
        const resp = await fetch(`${API_URL}/v1/links?page=${currentPage}`, {credentials: 'include'});

        if (resp && resp.ok) {
          const {data} = await resp.json();

          // Add data fetched to the dataset.
          aggregatedData = [...aggregatedData, ...data];

          // Did we come across a non-full page of data? If so, we're at the end and we're done.
          if (data.length < 20) {
            dispatch(collectionLinksSet(aggregatedData, 0));
            return;
          } else {
            // Fetched a full page of data; fetch the next page.
            currentPage += 1;
            continue;
          }
        } else if (resp) {
          // Ran into error fetching links. We're done, return.
          const data = await resp.text();
          dispatch(collectionLinksError(`Error fetching links: ${data}`));
          return;
        }
      }
    } catch (err) {
      dispatch(collectionLinksError(`Couldn't fetch link collection: ${err.message}`));
    }
  };
}
