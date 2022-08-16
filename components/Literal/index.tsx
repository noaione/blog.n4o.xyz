import React from 'react';
import Carousel from 'react-multi-carousel';

import { getBooksByReadingStateAndHandle, ReadingStatus, Book } from './api';

interface LiteralClubProps {
  readingState: ReadingStatus;
  handle: string;
}

interface LiteralClubState {
  books: Book[];
  isLoading: boolean;
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1280 },
    items: 4,
    slidesToSlide: 4, // optional, default to 1.
    partialVisibilityGutter: 40,
  },
  tablet: {
    breakpoint: { max: 1280, min: 768 },
    items: 3,
    slidesToSlide: 3, // optional, default to 1.
    partialVisibilityGutter: 30,
  },
  mobile: {
    breakpoint: { max: 768, min: 0 },
    items: 2,
    slidesToSlide: 2, // optional, default to 1.
    partialVisibilityGutter: 30,
  },
};

function LiteralCover(props: { url: string; title: string; authors: string }) {
  // empty string, fallback to custom placeholder
  const { url, title, authors } = props;
  if (!url) {
    return (
      <div className="flex flex-col p-4 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 w-full rounded-md">
        <div className="text-base font-semibold">{title}</div>
        <div className="literal-separator"></div>
        <div className="text-sm font-medium" style={{ textAlign: 'right' }}>
          {authors}
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img className="h-full rounded-md" src={url} alt={title} />;
}

function LiteralBook(props: { book: Book; handle: string }) {
  const { book, handle } = props;

  const slugCreate = `https://literal.club/${handle}/book/${book.slug}`;

  const authors = book.authors.map((author) => author.name).join(', ');

  return (
    <div className="flex flex-col align-bottom p-2">
      <div className="flex flex-col h-full" style={{ height: '100%' }}>
        <LiteralCover url={book.cover} title={book.title} authors={authors} />
      </div>
      <a href={slugCreate} className="text-blue-500 hover:text-blue-600 transition mt-2">
        {book.title}
      </a>
    </div>
  );
}

export default class LiteralClubEmbed extends React.Component<LiteralClubProps, LiteralClubState> {
  constructor(props: LiteralClubProps) {
    super(props);
    this.state = {
      books: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    const books = await getBooksByReadingStateAndHandle(
      this.props.readingState,
      this.props.handle,
      50,
      0
    );
    console.info(books);
    this.setState({ books, isLoading: false });
  }

  render(): React.ReactNode {
    const { handle } = this.props;
    const { books, isLoading } = this.state;
    if (isLoading) {
      return <div>Loading...</div>;
    }

    return (
      <Carousel
        draggable={false}
        showDots={false}
        responsive={responsive}
        autoPlaySpeed={5000}
        keyBoardControl={false}
        partialVisbile
        swipeable
        autoPlay
        infinite
      >
        {books.map((book) => {
          return <LiteralBook key={book.id} book={book} handle={handle} />;
        })}
      </Carousel>
    );
  }
}
