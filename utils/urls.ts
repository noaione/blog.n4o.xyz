function isURLInternal(value: string): boolean {
  if (typeof URL.canParse === "function" && URL.canParse(value)) {
    return true;
  }

  try {
    new URL(value);

    return true;
  } catch {
    return false;
  }
}

export function isURL(value: string): boolean {
  if (typeof value === "string" && isURLInternal(value)) {
    return true;
  }

  return false;
}

