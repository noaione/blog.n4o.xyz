const filenameRegex = /(?<date>[\d]{4}-[\d]{2}-[\d]{2})-(?<fn>.*)/;

export function extractDateFromFilename(file: string) {
  // we expect file to be in format of `YYYY-MM-DD-title.md`
  const match = filenameRegex.exec(file);

  if (!match) {
    throw new Error(`Filename ${file} does not follow the format: YYYY-MM-DD-title.md`);
  }

  const dateParsed = new Date(match.groups!.date);

  if (isNaN(dateParsed.getTime())) {
    throw new Error(`Date ${file} is not a valid date`);
  }

  return {
    date: dateParsed,
    title: match.groups!.fn,
  };
}
