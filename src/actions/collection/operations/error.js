export const COLLECTION_OPERATIONS_ERROR = 'COLLECTION_OPERATIONS_ERROR';

export default function collectionOperationsError(error) {
  return { type: COLLECTION_OPERATIONS_ERROR, error: error.message ? error.message : error };
}
