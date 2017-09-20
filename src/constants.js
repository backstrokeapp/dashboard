export let API_URL;
export const ROOT_URL = process.env.REACT_ROOT_API_URL || 'https://api.backstroke.co';

export function setApiUrl(url) {
  API_URL = url;
}
