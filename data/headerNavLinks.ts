export interface HeaderNavs {
  href: string;
  title: string;
}

const headerNavLinks: HeaderNavs[] = [
  { href: '/posts', title: 'Posts' },
  { href: '/tags', title: 'Tags' },
  { href: '/projects', title: 'Projects' },
  { href: '/about', title: 'About' },
];

export default headerNavLinks;
