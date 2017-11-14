import collectionLinksFetch from '../collection/links/fetch';
import collectionOperationsFetch from '../collection/operations/fetch';

export const ROUTE_TRANSITION_LINK_DETAIL = 'ROUTE_TRANSITION_LINK_DETAIL';

export default function routeTransitionLinkDetail(id) {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LINK_DETAIL, id});
    // Fetch link details
    dispatch(collectionLinksFetch());
    // Fetch all link operations that happened to the given link
    dispatch(collectionOperationsFetch(id));
  };
}
