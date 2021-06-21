import fs from 'fs'
import glob from 'tiny-glob/sync'
import matter from 'gray-matter'
import visit from 'unist-util-visit'
import path from 'path'
import readingTime from 'reading-time'
import { serialize } from 'next-mdx-remote/serialize'

import MDXComponents from '@/components/MDXComponents'
import imgToJsx from './img-to-jsx'
import Twemoji from './twemoji'
import CustomHeading from './custom-heading'

const root = process.cwd()

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
}

function findFirstLine(textData) {
  for (let i = 0; i < textData.length; i++) {
    const clean = textData[i].replace(/\r/, '')
    if (clean.replace(/\s/, '').length > 0) {
      return clean
    }
  }
  return ''
}

function formatSeparators(textData, separators) {
  if (typeof separators !== 'string') {
    return findFirstLine(textData)
  }
  const joinedText = []
  for (let i = 0; i < textData.length; i++) {
    const clean = textData[i].replace(/\r/, '')
    if (clean === separators) {
      break
    }
    joinedText.push(clean)
  }
  // Bruh
  if (joinedText.length === textData.length) {
    return findFirstLine(textData)
  }
  return joinedText.join('\n')
}

function excerptFormatter(file, options) {
  file.excerpt = formatSeparators(file.content.split('\n'), options.excerpt_separator)
}

function formatDateToYMD(dateData) {
  const month = dateData.getUTCMonth().toString().padStart(2, '0')
  const days = dateData.getUTCDay().toString().padStart(2, '0')
  return `${dateData.getUTCFullYear()}-${month}-${days}`
}

function parseSlug(slugName) {
  // eslint-disable-next-line no-useless-escape
  const re = /([0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2})?\-?(.*)/i
  const parsed = slugName.match(re)
  if (parsed === null) {
    return [undefined, slugName]
  }
  return [parsed[1], parsed[2]]
}

function findLocaleVersion(paths, locales = ['en', 'id']) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    if (locales.includes(path)) {
      return path
    }
  }
  return null
}

function tryToSplitPath(paths) {
  let splitForward = paths.split('/')
  if (splitForward.length === 1) {
    let splitBack = paths.split('\\')
    if (splitBack.length > 1) {
      return splitBack
    }
  }
  return splitForward
}

export async function getFiles(type, extra = '*', locales = ['en', 'id'], defaultLocale = 'en') {
  const finalPaths = path.join(root, 'data', type, '**', extra).replace(/\\/g, '/')
  const allFiles = glob(finalPaths, { filesOnly: true })
  const remappedFilesData = allFiles.map((res) => {
    const fnSplit = tryToSplitPath(res)
    const [dateFromFile, fileItself] = parseSlug(fnSplit[fnSplit.length - 1])
    const realLocale = findLocaleVersion(fnSplit, locales) || defaultLocale
    if (res.startsWith(root)) {
      return {
        file: res,
        slug: fileItself,
        rawDate: 'xxxx-xx-xx',
        locale: realLocale,
        isDir: true,
      }
    }
    if (typeof dateFromFile !== 'undefined') {
      return {
        file: res,
        slug: fileItself,
        rawDate: dateFromFile,
        locale: realLocale,
        isDir: false,
      }
    }
    const { birthtime } = fs.statSync(path.join(root, res))
    return {
      file: res,
      slug: fileItself,
      rawDate: formatDateToYMD(birthtime),
      locale: realLocale,
      isDir: false,
    }
  })
  return remappedFilesData.filter((r) => !r.isDir)
}

export function formatSlug(slug) {
  return slug.replace(/\.(mdx|md)/, '')
}

export function dateSortDesc(a, b) {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

export async function getFileBySlug(type, postData, locales = ['en', 'id'], defaultLocale = 'en') {
  const isMdx = postData.file.endsWith('.mdx')
  const source = fs.readFileSync(path.join(root, postData.file))
  const { data, content } = matter(source, { excerpt: true, excerpt_separator: '<!--more-->' })
  // eslint-disable-next-line no-prototype-builtins
  if (!data.hasOwnProperty('date')) {
    data.date = postData.date
  }
  // eslint-disable-next-line no-prototype-builtins
  if (!data.hasOwnProperty('locale')) {
    data.locale = postData.locale
  }
  const mdxSource = await serialize(content, {
    components: MDXComponents,
    mdxOptions: {
      remarkPlugins: [
        require('remark-slug'),
        CustomHeading,
        [
          require('remark-autolink-headings'),
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
        [require('remark-footnotes'), { inlineNotes: true }],
        require('remark-gemoji'),
        Twemoji,
        require('remark-code-titles'),
        require('remark-math'),
        [require('remark-toc'), { ordered: true, tight: true }],
        require('remark-admonitions'),
        imgToJsx,
      ],
      inlineNotes: true,
      rehypePlugins: [
        require('rehype-katex'),
        [require('@mapbox/rehype-prism'), { ignoreMissing: true }],
        // [require('@jsdevtools/rehype-toc'), {}],
        () => {
          return (tree) => {
            visit(tree, 'element', (node, index, parent) => {
              let [token, type] = node.properties.className || []
              if (token === 'token') {
                node.properties.className = [tokenClassNames[type]]
              }
            })
          }
        },
      ],
    },
  })
  const fnSplit = tryToSplitPath(postData.file)
  const fileName = fnSplit[fnSplit.length - 1] || postData.slug

  return {
    mdxSource,
    frontMatter: {
      // https://scholarwithin.com/average-reading-speed
      readingTime: readingTime(content, { wordsPerMinute: 275 }),
      slug: formatSlug(postData.slug) || null,
      fileName,
      ...data,
    },
  }
}

export async function getAllFilesFrontMatter(
  type,
  selectedLocale = 'en',
  locales = ['en', 'id'],
  defaultLocale = 'en'
) {
  const files = await getFiles(type, '*', locales, defaultLocale)

  const allFrontMatter = []

  files.forEach((file) => {
    const source = fs.readFileSync(path.join(root, file.file), 'utf8')
    const { data, excerpt } = matter(source, {
      excerpt: excerptFormatter,
      excerpt_separator: '<!--more-->',
    })
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('date')) {
      data.date = file.rawDate
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('summary')) {
      data.summary = excerpt
    }
    // Check if there's locale property or no
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('locale')) {
      data.locale = file.locale
    }
    // let's override the slug
    if (typeof data.slug === 'string') {
      allFrontMatter.push({ ...data, slug: formatSlug(data.slug), file: file.file })
      return
    }
    if (data.draft !== true && process.env.NODE_ENV !== 'development') {
      return
    }
    allFrontMatter.push({ ...data, slug: formatSlug(file.slug), file: file.file })
  })

  const filteredFrontMatter = allFrontMatter.filter(({ locale }) => {
    if (selectedLocale === undefined) {
      return true
    }
    if (!locale) {
      return true
    }
    if (locale === selectedLocale) {
      return true
    }
    return false
  })

  return filteredFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date))
}
