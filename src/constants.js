export let API_URL;
export const ROOT_URL = process.env.REACT_ROOT_API_URL || 'https://backstroke.us';

export function setApiUrl(url) {
  API_URL = url;
}
