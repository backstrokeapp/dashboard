export const COLLECTION_OPERATIONS_SELECT = 'COLLECTION_OPERATIONS_SELECT';

export default function collectionOperationsSelect(data) {
  return { type: COLLECTION_OPERATIONS_SELECT, data };
}
