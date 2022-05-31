/**
 * A modified version of rehype-twemojify
 * https://github.com/cliid/rehype-twemojify
 */

import emojiRegex from 'emoji-regex';
import twemoji from 'twemoji';
import type { Content, ElementContent, Root, RootContent } from 'hast';
import type { Plugin, Transformer } from 'unified';
import { map } from 'unist-util-map';
import { stringReplace } from './replacer';
import {
  FrameworkNextOptions,
  Options,
  resolveOptions,
  TwemojiOptions,
  UserOptions,
} from './config';

const regex = emojiRegex();

function sizeToExtension(size: TwemojiOptions['size']): string {
  switch (size) {
    case '72x72':
      return '.png';
    case 'svg':
      return '.svg';
    default:
      throw new Error('Unknown size');
  }
}

function formatParams(params: FrameworkNextOptions['params']): string {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => urlParams.append(key, value.toString()));
  return urlParams.toString();
}

const UFE0Fg = /\uFE0F/g;
const U200D = String.fromCharCode(0x200d);

function toCodePoint(emoji: string): string {
  return twemoji.convert.toCodePoint(emoji.indexOf(U200D) < 0 ? emoji.replace(UFE0Fg, '') : emoji);
}

function toBaseUrl(codePoint: string, options: TwemojiOptions): string {
  return `${options.baseUrl}/${options.size}/${codePoint}${sizeToExtension(options.size)}`;
}

function toNextUrl(
  emoji: string,
  nextOptions: FrameworkNextOptions,
  options: TwemojiOptions
): string {
  const codePoint = toCodePoint(emoji);
  return `/_next/image?url=${toBaseUrl(codePoint, options)}&${formatParams(nextOptions.params)}`;
}

function toUrl(emoji: string, options: Options) {
  switch (options.framework.type) {
    case 'next':
      return toNextUrl(emoji, options.framework, options.twemoji);

    default:
      // your framework isn't supported yet...
      return toBaseUrl(toCodePoint(emoji), options.twemoji);
  }
}

function makeTransformer(options: Options): Transformer<Root, Root> {
  return (tree: Root) => {
    const mappedChildren = tree.children.map(
      (child) =>
        map(child, (node: RootContent) => {
          if (node.type !== 'text' || !regex.test(node.value)) {
            return node;
          }

          const children = stringReplace(node.value, regex, (text) => ({
            emoji: text,
          })).map<ElementContent>((segment) =>
            typeof segment === 'string'
              ? {
                  type: 'text',
                  value: segment,
                }
              : options.exclude.includes(segment.emoji)
              ? {
                  type: 'text',
                  value: segment.emoji,
                }
              : {
                  type: 'element',
                  tagName: 'img',
                  properties: {
                    className: [options.className],
                    draggable: 'false',
                    alt: segment.emoji,
                    decoding: 'async',
                    src: toUrl(segment.emoji, options),
                  },
                  children: [],
                }
          );

          const result: Content = {
            type: 'element',
            tagName: 'span',
            children,
          };

          return result;
        }) as RootContent
    );

    return {
      ...tree,
      children: mappedChildren,
    };
  };
}

/**
 * Plugin to twemoji-fy ordinary emojis in HTML.
 */
const rehypeTwemojify: Plugin<[UserOptions?], Root, Root> = function (userOptions) {
  const options = resolveOptions(userOptions);
  return makeTransformer(options);
};

export default rehypeTwemojify;
