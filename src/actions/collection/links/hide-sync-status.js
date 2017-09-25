import collectionLinksPush from './push';

export default function hideSyncStatus(link) {
  return dispatch => {
    // CLear the `lastWebhookSync` item from the given link.
    dispatch(collectionLinksPush({...link, lastWebhookSync: undefined}));
  }
}
