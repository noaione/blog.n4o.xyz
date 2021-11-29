import siteMetadata from '@/data/siteMetadata.json';
import ListLayout from '@/layouts/ListLayout';
import { FrontMatterData, PageSeo } from '@/components/SEO';
import { PaginationProps } from '@/components/Pagination';

import { useIntl } from 'react-intl';
import { GetStaticPropsContext } from 'next';

export const POSTS_PER_PAGE = 5;

export async function getStaticProps({ locale, locales, defaultLocale }: GetStaticPropsContext) {
  const { getAllFilesFrontMatter } = await import('@/lib/mdx');
  const getPosts = await getAllFilesFrontMatter('blog', locale, locales, defaultLocale);
  const posts = getPosts.splice(0, POSTS_PER_PAGE);
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(getPosts.length / POSTS_PER_PAGE) + 1,
  };

  return { props: { posts, pagination } };
}

interface BlogProps {
  posts: FrontMatterData[];
  pagination: PaginationProps;
}

export default function Blog({ posts, pagination }: BlogProps) {
  const intl = useIntl();

  const messages = { id: 'posts', description: undefined, defaultMessage: undefined };
  return (
    <>
      <PageSeo
        title={intl.formatMessage({ id: 'posts' })}
        description={intl.formatMessage({ id: 'descPostsPage' }, { blogName: siteMetadata.title })}
      />
      <ListLayout
        posts={posts}
        pagination={pagination}
        title={intl.formatMessage(messages)}
        isPosts
      />
    </>
  );
}
