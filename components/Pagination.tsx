import Link from '@/components/Link';

import ChevronRight from '@heroicons/react/solid/ChevronRightIcon';
import ChevronLeft from '@heroicons/react/solid/ChevronLeftIcon';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

export interface PaginationProps {
  totalPages: string | number;
  currentPage: string | number;
  isPosts?: boolean;
}

export default function Pagination({ totalPages, currentPage, isPosts }: PaginationProps) {
  const intl = useIntl();
  const router = useRouter();

  currentPage = parseInt(currentPage as string);
  totalPages = parseInt(totalPages as string);
  const prevPage = parseInt(currentPage as unknown as string) - 1 > 0;
  const nextPage =
    parseInt(currentPage as unknown as string) + 1 <= parseInt(totalPages as unknown as string);
  const pageOf = intl.formatMessage({ id: 'paginateOf' });

  const baseUrl = isPosts ? '/posts/' : `/tags/${router.query?.tag}/`;

  return (
    <div className="pt-6 pb-8 space-y-2 md:space-y-5">
      <nav className="flex flex-row text-center justify-center items-center lg:justify-between">
        {!prevPage && (
          <button
            aria-label="Previous Page (Disabled)"
            className="flex flex-row items-center text-gray-900 dark:text-gray-100 cursor-not-allowed disabled:opacity-50 invisible"
            disabled={!prevPage}
          >
            <ChevronLeft className="w-5 h-5" aria-label="Paginate to Previous Page" />
            <span className="hidden lg:block">{intl.formatMessage({ id: 'paginateBefore' })}</span>
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? baseUrl : `${baseUrl}page/${currentPage - 1}`}
            locale={router.locale}
          >
            <button
              aria-label="Previous Page"
              className="flex flex-row items-center text-gray-900 dark:text-gray-100 hover:underline focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5" aria-label="Paginate to Previous Page" />
              <span className="hidden lg:block">
                {intl.formatMessage({ id: 'paginateBefore' })}
              </span>
            </button>
          </Link>
        )}
        <span className="text-gray-700 dark:text-gray-300 font-semibold">{`${currentPage.toLocaleString()} ${pageOf} ${totalPages.toLocaleString()}`}</span>
        {!nextPage && (
          <button
            aria-label="Next Page (Disabled)"
            className="flex flex-row items-center text-gray-900 dark:text-gray-100 cursor-not-allowed disabled:opacity-50 invisible"
            disabled={!nextPage}
          >
            <span className="hidden lg:block">{intl.formatMessage({ id: 'paginateNext' })}</span>
            <ChevronRight className="w-5 h-5" aria-label="Paginate to Next Page" />
          </button>
        )}
        {nextPage && (
          <Link href={`${baseUrl}page/${currentPage + 1}`} locale={router.locale}>
            <button
              aria-label="Previous Page"
              className="flex flex-row items-center text-gray-900 dark:text-gray-100 hover:underline focus:outline-none"
            >
              <span className="hidden lg:block">{intl.formatMessage({ id: 'paginateNext' })}</span>
              <ChevronRight className="w-5 h-5" aria-label="Paginate to Next Page" />
            </button>
          </Link>
        )}
      </nav>
    </div>
  );
}
