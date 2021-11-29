import fs from 'fs';
import { bundleMDX } from 'mdx-bundler';
import glob from 'tiny-glob/sync';
import matter from 'gray-matter';
import { visit, Node } from 'unist-util-visit';
import path from 'path';
import readingTime from 'reading-time';

import { FrontMatterData } from '@/components/SEO';

import ImageToJSX from './img-to-jsx';
import DisEmoteRemark from './disemote';
import RemarkCodeTitles from './remark-code-titles';
import CustomHeading from './custom-heading';

// import everything
import remarkSlug from 'remark-slug';
import remarkAutolinkHeadings from 'remark-autolink-headings';
import remarkGemoji from 'remark-gemoji';
import remarkGFM from 'remark-gfm';
import remarkFootnotes from 'remark-footnotes';
import remarkMath from 'remark-math';

import rehypeKatex from 'rehype-katex';
import rehypeTwemojify from 'rehype-twemojify';
import rehypePrism from 'rehype-prism-plus';

const root = process.cwd();

const tokenClassNames = {
  tag: 'text-code-red',
  'attr-name': 'text-code-yellow',
  'attr-value': 'text-code-green',
  deleted: 'text-code-red',
  inserted: 'text-code-green',
  punctuation: 'text-code-white',
  keyword: 'text-code-purple',
  string: 'text-code-green',
  function: 'text-code-blue',
  boolean: 'text-code-red',
  comment: 'text-gray-400 italic',
};

function findFirstLine(textData) {
  for (let i = 0; i < textData.length; i++) {
    const clean = textData[i].replace(/\r/, '');
    if (clean.replace(/\s/, '').length > 0) {
      return clean;
    }
  }
  return '';
}

function formatSeparators(textData, separators) {
  if (typeof separators !== 'string') {
    return findFirstLine(textData);
  }
  const joinedText = [];
  for (let i = 0; i < textData.length; i++) {
    const clean = textData[i].replace(/\r/, '');
    if (clean === separators) {
      break;
    }
    joinedText.push(clean);
  }
  // Bruh
  if (joinedText.length === textData.length) {
    return findFirstLine(textData);
  }
  return joinedText.join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function excerptFormatter(file: any, options: any) {
  file.excerpt = formatSeparators(file.content.split('\n'), options.excerpt_separator);
}

function formatDateToYMD(dateData: Date) {
  const month = dateData.getUTCMonth().toString().padStart(2, '0');
  const days = dateData.getUTCDay().toString().padStart(2, '0');
  return `${dateData.getUTCFullYear()}-${month}-${days}`;
}

function parseSlug(slugName: string) {
  // eslint-disable-next-line no-useless-escape
  const re = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})?\-?(.*)/i;
  const parsed = slugName.match(re);
  if (parsed === null) {
    return [undefined, slugName];
  }
  return [parsed[1], parsed[2]];
}

function findLocaleVersion(paths: string[], locales = ['en', 'id']) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (locales.includes(path)) {
      return path;
    }
  }
  return null;
}

function tryToSplitPath(paths: string) {
  const splitForward = paths.split('/');
  if (splitForward.length === 1) {
    const splitBack = paths.split('\\');
    if (splitBack.length > 1) {
      return splitBack;
    }
  }
  return splitForward;
}

export interface RawPostFile {
  file: string;
  slug: string;
  rawDate: string;
  locale: string;
  isDir: boolean;
}

export async function getFiles(
  type: string,
  extra = '*',
  locales = ['en', 'id'],
  defaultLocale = 'en'
): Promise<RawPostFile[]> {
  const finalPaths = path.join(root, 'data', type, '**', extra).replace(/\\/g, '/');
  const allFiles = glob(finalPaths, { filesOnly: true });
  const remappedFilesData = allFiles.map((res) => {
    const fnSplit = tryToSplitPath(res);
    const [dateFromFile, fileItself] = parseSlug(fnSplit[fnSplit.length - 1]);
    const realLocale = findLocaleVersion(fnSplit, locales) || defaultLocale;
    if (res.startsWith(root)) {
      return {
        file: res,
        slug: fileItself,
        rawDate: 'xxxx-xx-xx',
        locale: realLocale,
        isDir: true,
      };
    }
    if (typeof dateFromFile !== 'undefined') {
      return {
        file: res,
        slug: fileItself,
        rawDate: dateFromFile,
        locale: realLocale,
        isDir: false,
      };
    }
    const { birthtime } = fs.statSync(path.join(root, res));
    return {
      file: res,
      slug: fileItself,
      rawDate: formatDateToYMD(birthtime),
      locale: realLocale,
      isDir: false,
    };
  });
  return remappedFilesData.filter((r) => !r.isDir);
}

export function formatSlug(slug: string) {
  return slug.replace(/\.(mdx|md)/, '');
}

export function dateSortDesc(a: string, b: string) {
  if (a > b) return -1;
  if (a < b) return 1;
  return 0;
}

interface RawBlogContent {
  mdxSource: string;
  frontMatter: FrontMatterData;
}

export async function getFileBySlug(postData: FrontMatterExtended): Promise<RawBlogContent> {
  const source = fs.readFileSync(path.join(root, postData.file));
  const { data, content } = matter(source, {
    // @ts-ignore
    excerpt: excerptFormatter,
    excerpt_separator: '<!--more-->',
  });
  // eslint-disable-next-line no-prototype-builtins
  if (!data.hasOwnProperty('date')) {
    data.date = postData.date;
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!data.hasOwnProperty('locale')) {
    data.locale = postData.locale;
  }

  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(
      process.cwd(),
      'node_modules',
      'esbuild',
      'esbuild.exe'
    );
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(
      process.cwd(),
      'node_modules',
      'esbuild',
      'bin',
      'esbuild'
    );
  }
  const realContent = content.replace('<!--more-->', '{/* more */}');

  const { code } = await bundleMDX({
    source: realContent,
    xdmOptions(options) {
      (options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkSlug,
        CustomHeading,
        [
          remarkAutolinkHeadings,
          {
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['h-autolink'] },
              children: [{ type: 'text', value: '#' }],
            },
            linkProperties: { ariaHidden: 'true', tabIndex: -1, className: 'h-autolink-wrap' },
          },
        ],
        remarkGemoji,
        remarkGFM,
        RemarkCodeTitles,
        DisEmoteRemark,
        [remarkFootnotes, { inlineNotes: true }],
        remarkMath,
        ImageToJSX,
      ]),
        (options.rehypePlugins = [
          ...(options.rehypePlugins || []),
          [rehypeTwemojify, { className: 'twemoji-inline' }],
          rehypeKatex,
          [rehypePrism, { ignoreMissing: true, showLineNumbers: false }],
          () => {
            return (tree) => {
              visit(tree, 'element', (node: Node) => {
                // @ts-ignore
                const { properties } = node;
                if (properties) {
                  // @ts-ignore
                  const [token, type] = properties.className || [];
                  if (token === 'token') {
                    // @ts-ignore
                    node.properties.className = [tokenClassNames[type]];
                  }
                }
              });
            };
          },
        ]);
      return options;
    },
    esbuildOptions: (options) => {
      options.loader = {
        ...options.loader,
        // @ts-ignore
        '.js': 'jsx',
        // @ts-ignore
        '.ts': 'tsx',
      };
      return options;
    },
  });

  const fnSplit = tryToSplitPath(postData.file);
  const fileName = fnSplit[fnSplit.length - 1] || postData.slug;

  return {
    mdxSource: code,
    frontMatter: {
      // https://scholarwithin.com/average-reading-speed
      readingTime: readingTime(content, { wordsPerMinute: 275 }),
      slug: formatSlug(postData.slug) || null,
      fileName,
      ...(data as FrontMatterData),
    },
  };
}

interface FrontMatterExtended extends FrontMatterData {
  file?: string;
}

export async function getAllFilesFrontMatter(
  type: string,
  selectedLocale = 'en',
  locales = ['en', 'id'],
  defaultLocale = 'en'
): Promise<FrontMatterExtended[]> {
  const files = await getFiles(type, '*', locales, defaultLocale);

  const allFrontMatter: FrontMatterExtended[] = [];

  files.forEach((file) => {
    const filePath = path.join(root, file.file);
    if (!['.md', '.mdx', 'md', 'mdx'].includes(path.extname(filePath))) {
      return;
    }
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, excerpt } = matter(source, {
      // @ts-ignore
      excerpt: excerptFormatter,
      excerpt_separator: '<!--more-->',
    });
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('date')) {
      data.date = file.rawDate;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('summary')) {
      data.summary = excerpt;
    }
    // Check if there's locale property or no
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('locale')) {
      data.locale = file.locale;
    }
    // let's override the slug
    if (typeof data.slug === 'string') {
      allFrontMatter.push({
        ...(data as FrontMatterData),
        slug: formatSlug(data.slug),
        file: file.file,
      });
      return;
    }
    if (data.draft === true && process.env.NODE_ENV !== 'development') {
      return;
    }
    allFrontMatter.push({
      ...(data as FrontMatterData),
      slug: formatSlug(file.slug),
      file: file.file,
    });
  });

  const filteredFrontMatter = allFrontMatter.filter(({ locale }) => {
    if (selectedLocale === undefined) {
      return true;
    }
    if (!locale) {
      return true;
    }
    if (locale === selectedLocale) {
      return true;
    }
    return false;
  });

  return filteredFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date));
}
