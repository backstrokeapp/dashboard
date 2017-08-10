export const COLLECTION_LINKS_START_LOADING = 'COLLECTION_LINKS_START_LOADING';

export default function collectionLinksStartLoading(item) {
  return { type: COLLECTION_LINKS_START_LOADING, item };
}
