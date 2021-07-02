import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

import { getFiles } from './mdx'
import { kebabCase } from './utils'

const root = process.cwd()

export interface TagCount {
  count: number
  locale: string
}

export async function getAllTags(
  type: string,
  selectedLocale = 'en',
  locales = ['en', 'id'],
  defaultLocale = 'en',
  returnPaths = false
) {
  const files = await getFiles(type, '*', locales, defaultLocale)

  const tagCount: { [key: string]: TagCount } = {}
  const properLocalizedData: {
    [locale: string]: {
      [key: string]: TagCount
    }
  } = {}
  locales.map((r) => {
    properLocalizedData[r] = {}
  })
  // Iterate through each post, putting all found tags into `tags`
  files.forEach((file) => {
    const source = fs.readFileSync(path.join(root, file.file), 'utf8')
    const { data } = matter(source)
    // Check if there's locale property or no
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('locale')) {
      data.locale = file.locale
    }
    if (!returnPaths && selectedLocale !== data.locale) {
      return
    }
    // eslint-disable-next-line no-prototype-builtins
    if (!data.hasOwnProperty('date')) {
      data.date = file.rawDate
    }
    if (data.tags && data.draft !== true) {
      data.tags.forEach((tag) => {
        const formattedTag = kebabCase(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag]['count'] += 1
        } else {
          tagCount[formattedTag] = { count: 1, locale: data.locale }
        }
        if (data.locale in properLocalizedData) {
          if (formattedTag in properLocalizedData[data.locale]) {
            properLocalizedData[data.locale][formattedTag]['count'] += 1
          } else {
            properLocalizedData[data.locale][formattedTag] = { count: 1, locale: data.locale }
          }
        } else {
          properLocalizedData[data.locale] = {}
        }
      })
    }
  })
  if (returnPaths) {
    return properLocalizedData
  }

  return tagCount
}
