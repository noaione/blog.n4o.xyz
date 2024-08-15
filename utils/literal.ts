export type LiteralReadingStatus = "IS_READING" | "WANTS_TO_READ" | "FINISHED" | "DROPPED" | "NONE";

type Nullable<T> = T | null;

interface TypeName {
  __typename: string;
}

interface LiteralAuthorMini extends TypeName {
  id: string;
  name: string;
  slug: string;
}

export interface LiteralBook extends TypeName {
  id: string;
  slug: string;
  title: string;
  subtitle: Nullable<string>;
  description: Nullable<string>;
  isbn10: Nullable<string>;
  isbn13: Nullable<string>;
  language: string;
  pageCount: Nullable<number>;
  publishedDate: Nullable<string>;
  publisher: Nullable<string>;
  physicalFormat: Nullable<string>;
  cover: string;
  authors: LiteralAuthorMini[];
  gradientColors: string[];
  workId: Nullable<string>;
}

export interface BooksByReadingStateAndHandle {
  data: {
    booksByReadingStateAndHandle: LiteralBook[];
  };
}

export const LiteralGraphQLQuery = `
query booksByReadingStateAndHandle($limit: Int!, $offset: Int!, $readingStatus: ReadingStatus!, $handle: String!) {
    booksByReadingStateAndHandle(
        limit: $limit
        offset: $offset
        readingStatus: $readingStatus
        handle: $handle
    ) {
        ...BookParts
        __typename
    }
}

fragment BookParts on Book {
    id
    slug
    title
    subtitle
    description
    isbn10
    isbn13
    language
    pageCount
    publishedDate
    publisher
    physicalFormat
    cover
    authors {
        ...AuthorMini
        __typename
    }
    gradientColors
    workId
    __typename
}

fragment AuthorMini on Author {
    id
    name
    slug
    __typename
}
`;
