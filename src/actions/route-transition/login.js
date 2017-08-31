export const ROUTE_TRANSITION_LOGIN = 'ROUTE_TRANSITION_LOGIN';

export default function routeTransitionLogin() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LOGIN });
  };
}
