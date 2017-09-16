export const ROUTE_TRANSITION_LOGIN_CONFIRMATION = 'ROUTE_TRANSITION_LOGIN_CONFIRMATION';

export default function routeTransitionLoginConfirmation() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LOGIN_CONFIRMATION });
  };
}
