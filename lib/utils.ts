export type Nullable<T> = T | null;
export type NoneType = null | undefined;

export const kebabCase = (str: string) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('-');

export function isNone(data: unknown): data is NoneType {
  return data === null || typeof data === 'undefined';
}

export function mapBoolean(input_data: unknown) {
  if (isNone(input_data)) {
    return false;
  }
  let fstat = false;
  let data: string;
  if (typeof input_data === 'string') {
    data = input_data.toLowerCase();
  } else if (typeof input_data === 'number') {
    data = input_data.toString().toLowerCase();
  } else if (typeof input_data === 'object') {
    data = JSON.stringify(input_data);
  } else if (typeof input_data === 'boolean') {
    return input_data;
  } else {
    data = input_data.toString().toLowerCase();
  }
  switch (data) {
    case 'y':
      fstat = true;
      break;
    case 'enable':
      fstat = true;
      break;
    case 'true':
      fstat = true;
      break;
    case '1':
      fstat = true;
      break;
    case 'yes':
      fstat = true;
      break;
    default:
      break;
  }
  return fstat;
}

export function zeroPad(num: number) {
  return Math.floor(num).toString().padStart(2, '0');
}

export function durationToText(seconds: number) {
  if (seconds < 0) {
    return 'N/A';
  }
  const s = seconds % 60;
  const m = (seconds / 60) % 60;
  const h = (seconds / 3600) % 60;
  if (h >= 1) {
    return `${zeroPad(h)}:${zeroPad(m)}:${zeroPad(s)}`;
  }
  return `${zeroPad(m)}:${zeroPad(s)}`;
}
