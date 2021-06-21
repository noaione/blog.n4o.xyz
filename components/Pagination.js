import Link from '@/components/Link'

import ChevronRight from '@heroicons/react/solid/ChevronRightIcon'
import ChevronLeft from '@heroicons/react/solid/ChevronLeftIcon'
import { useIntl } from 'react-intl'

export default function Pagination({ totalPages, currentPage }) {
  const intl = useIntl()
  currentPage = parseInt(currentPage)
  totalPages = parseInt(totalPages)
  const prevPage = parseInt(currentPage) - 1 > 0
  const nextPage = parseInt(currentPage) + 1 <= parseInt(totalPages)
  const pageOf = intl.formatMessage({ id: 'paginateOf' })

  return (
    <div className="pt-6 pb-8 space-y-2 md:space-y-5">
      <nav className="flex flex-row text-center justify-center items-center lg:justify-between">
        {!prevPage && (
          <button
            rel="previous"
            className="flex flex-row items-center text-gray-900 dark:text-gray-100 cursor-not-allowed disabled:opacity-50"
            disabled={!prevPage}
          >
            <ChevronLeft className="w-5 h-5" aria-label="Paginate to Previous Page" />
            <span className="hidden lg:block">{intl.formatMessage({ id: 'paginateBefore' })}</span>
          </button>
        )}
        {prevPage && (
          <Link href={currentPage - 1 === 1 ? `/posts/` : `/posts/page/${currentPage - 1}`}>
            <button
              rel="previous"
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
            rel="next"
            className="flex flex-row items-center text-gray-900 dark:text-gray-100 cursor-not-allowed disabled:opacity-50"
            disabled={!nextPage}
          >
            <span className="hidden lg:block">{intl.formatMessage({ id: 'paginateNext' })}</span>
            <ChevronRight className="w-5 h-5" aria-label="Paginate to Next Page" />
          </button>
        )}
        {nextPage && (
          <Link href={`/posts/page/${currentPage + 1}`}>
            <button
              rel="next"
              className="flex flex-row items-center text-gray-900 dark:text-gray-100 hover:underline focus:outline-none"
            >
              <span className="hidden lg:block">{intl.formatMessage({ id: 'paginateNext' })}</span>
              <ChevronRight className="w-5 h-5" aria-label="Paginate to Next Page" />
            </button>
          </Link>
        )}
      </nav>
    </div>
  )
}
