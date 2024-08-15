export function castBooleanNull(value: string | undefined): boolean | null {
  if (!value) {
    return null;
  }

  const trueCase = ["true", "1", "yes", "y", "on", "enabled", "enable"];

  return trueCase.includes(value.toLowerCase());
}
