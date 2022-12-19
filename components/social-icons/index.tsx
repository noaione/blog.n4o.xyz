import Donate from './donate';
import Mail from './mail';
import Github from './github';
import Facebook from './facebook';
import Twitter from './twitter';
import Mastodon from './mastodon';
import Trakteer from './trakteer';
import { IconProps } from './_types';
import { isNone, Nullable } from '@/lib/utils';

// Icons taken from: https://simpleicons.org/

const Components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  twitter: Twitter,
  trakteer: Trakteer,
  donate: Donate,
  mastodon: Mastodon,
};

interface SocialIconProps {
  kind: keyof typeof Components;
  href?: Nullable<string>;
  size?: number;
  iconProps?: IconProps;
}

const SocialIcon = ({ kind, href, size = 8, iconProps = {} }: SocialIconProps) => {
  if (isNone(href)) return null;

  const SocialSvg = Components[kind];

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="me noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-${size} w-${size}`}
        {...iconProps}
      />
    </a>
  );
};

export default SocialIcon;
