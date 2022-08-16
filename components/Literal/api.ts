import axios from 'axios';

const GraphQLQuery = `
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

export type ReadingStatus = 'IS_READING' | 'WANTS_TO_READ' | 'FINISHED' | 'DROPPED' | 'NONE';
type Nullable<T> = T | null;

interface TypeName {
  __typename: string;
}

interface AuthorMini extends TypeName {
  id: string;
  name: string;
  slug: string;
}

export interface Book extends TypeName {
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
  authors: AuthorMini[];
  gradientColors: string[];
  workId: Nullable<string>;
}

interface BooksByReadingStateAndHandle {
  data: {
    booksByReadingStateAndHandle: Book[];
  };
}

export async function getBooksByReadingStateAndHandle(
  readingStatus: ReadingStatus,
  handle: string,
  limit: number,
  offset: number
) {
  const response = await axios.post<BooksByReadingStateAndHandle>('https://literal.club/graphql/', {
    query: GraphQLQuery,
    variables: {
      limit,
      offset,
      readingStatus,
      handle,
    },
  });

  return response.data.data.booksByReadingStateAndHandle;
}
