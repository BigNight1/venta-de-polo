import config from '../config';

export function getImageUrl(path: string) {
  if (!path) return '';
  return `${config().API_URL}${path}`;
} 