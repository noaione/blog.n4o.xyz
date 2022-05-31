interface ReplacerFunction<T> {
  // Full signature: match, p1, p2, ..., pN, offset, string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (match: string, ...args: any[]): T;
}

export function stringReplace<T = unknown>(
  string: string,
  regexp: RegExp,
  newSubStrOrFn: string | ReplacerFunction<T>,
  globalOffset = 0
): (T | string)[] {
  const output = [];

  const storedLastIndex = regexp.lastIndex;
  regexp.lastIndex = 0;

  let result;
  let lastIndex = 0;
  while ((result = regexp.exec(string))) {
    const index = result.index;

    if (result[0] === '') {
      // When the regexp is an empty string
      // we still want to advance our cursor to the next item.
      // This is the behavior of String.replace.
      regexp.lastIndex++;
    }

    if (index !== lastIndex) {
      output.push(string.substring(lastIndex, index));
    }

    const match = result[0];
    lastIndex = index + match.length;

    const out =
      typeof newSubStrOrFn === 'function'
        ? newSubStrOrFn.apply(this, result.concat(index + globalOffset, result.input))
        : newSubStrOrFn;
    output.push(out);

    if (!regexp.global) {
      break;
    }
  }

  if (lastIndex < string.length) {
    output.push(string.substring(lastIndex));
  }

  regexp.lastIndex = storedLastIndex;
  return output;
}
