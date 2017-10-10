import collectionLinksError from './error';
import collectionLinksPush from './push';

export default function refresh(id) {
  return async dispatch => {
    try {
      const resp = await fetch(`${process.env.BACKSTROKE_SERVER}/v1/links/${id}`)

      if (resp.ok) {
        const data = await resp.json()
        dispatch(collectionLinksPush(data))
      } else {
        throw new Error(`Received an error: ${resp.statusCode}`);
      }
    } catch (err) {
      dispatch(collectionLinksError(err));
    }
  }
}
